import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import TokenCard from '@/components/TokenCard';
import ArbitrageCard from '@/components/ArbitrageCard';
import type { ArbitrageOpportunity, PricesResponse, TokenPrice } from '@/types';

const SPREAD_THRESHOLD = 0.3;

function computeArbitrage(tokens: TokenPrice[], timestamp: number): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const token of tokens) {
    if (token.pools.length < 2) continue;

    for (let i = 0; i < token.pools.length; i++) {
      for (let j = i + 1; j < token.pools.length; j++) {
        const poolA = token.pools[i];
        const poolB = token.pools[j];

        if (poolA.price <= 0 || poolB.price <= 0) continue;

        let buyPool = poolA;
        let sellPool = poolB;
        if (poolA.price > poolB.price) {
          buyPool = poolB;
          sellPool = poolA;
        }

        const spread = ((sellPool.price - buyPool.price) / buyPool.price) * 100;

        if (spread >= SPREAD_THRESHOLD) {
          const tradeAmount = 1000;
          const tokensBought = tradeAmount / buyPool.price;
          const proceeds = tokensBought * sellPool.price;
          const profit = proceeds - tradeAmount;

          opportunities.push({
            id: `${token.symbol}-${buyPool.pool}-${sellPool.pool}-${timestamp}`,
            token: token.symbol,
            tokenName: token.name,
            buyPool: buyPool.pool,
            sellPool: sellPool.pool,
            buyPrice: buyPool.price,
            sellPrice: sellPool.price,
            spreadPercent: spread,
            estimatedProfit: profit,
            timestamp,
          });
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.spreadPercent - a.spreadPercent);
}

export default function Home() {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(3000);
  const [connected, setConnected] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PricesResponse = await res.json();
      setData(json);
      setConnected(true);
      setError(null);
    } catch (e) {
      setConnected(false);
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const timer = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const opportunities = useMemo(() => {
    if (!data) return [];
    return computeArbitrage(data.tokens, data.timestamp);
  }, [data]);

  const tokensWithArbitrage = useMemo(() => {
    const set = new Set(opportunities.map((o) => o.token));
    return set;
  }, [opportunities]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
      <Header
        refreshInterval={refreshInterval}
        onIntervalChange={setRefreshInterval}
        lastUpdate={data?.timestamp ?? null}
        isConnected={connected}
      />

      {error && (
        <div className="glass-card rounded-xl p-4 mb-6 border border-neon-red/30 bg-neon-red/5 flex items-center gap-3">
          <AlertTriangle className="text-neon-red" size={20} />
          <div>
            <p className="text-sm font-semibold text-neon-red">连接后端失败</p>
            <p className="text-xs text-white/50">
              请确认已启动后端服务: <code className="font-mono">cd api && pip install -r requirements.txt && python api.py</code>
            </p>
          </div>
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span className="text-neon-gold text-glow-gold">⚡</span> 套利机会
              {opportunities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-neon-gold/20 text-neon-gold text-xs font-mono font-bold">
                  {opportunities.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-white/40 mt-1">价差 ≥ {SPREAD_THRESHOLD}% 时触发</p>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-neon-purple" size={32} />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-white/40 text-sm">暂无套利机会，持续监控中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.slice(0, 6).map((opp) => (
              <ArbitrageCard key={opp.id} opp={opp} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white">代币价格监控</h2>
            <p className="text-xs text-white/40 mt-1">
              Raydium · Orca · Jupiter · Meteora 四大 DEX 池价格对比
            </p>
          </div>
          <span className="text-xs text-white/30 font-mono">
            {data?.tokens.length ?? 0} tokens
          </span>
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-neon-purple" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.tokens.map((token) => (
              <TokenCard
                key={token.symbol}
                token={token}
                hasArbitrage={tokensWithArbitrage.has(token.symbol)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-12 py-6 text-center">
        <p className="text-xs text-white/20 font-mono">
          Solana DEX Arbitrage Monitor · 模拟数据仅供演示
        </p>
      </footer>
    </div>
  );
}
