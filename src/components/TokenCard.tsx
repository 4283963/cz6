import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TokenPrice } from '@/types';
import { formatPrice, formatPercent, formatLiquidity } from '@/utils/format';
import Sparkline from './Sparkline';

interface TokenCardProps {
  token: TokenPrice;
  hasArbitrage: boolean;
}

export default function TokenCard({ token, hasArbitrage }: TokenCardProps) {
  const isPositive = token.change24h >= 0;
  const avgPrice = token.pools.reduce((sum, p) => sum + p.price, 0) / token.pools.length;

  return (
    <div
      className={`glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] ${
        hasArbitrage ? 'arbitrage-border shadow-neon-gold' : 'hover:shadow-neon-purple'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-xl border border-white/10">
            {token.icon}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-white">{token.symbol}</h3>
            <p className="text-xs text-white/50">{token.name}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-semibold ${
            isPositive
              ? 'bg-neon-green/10 text-neon-green text-glow-green'
              : 'bg-neon-red/10 text-neon-red text-glow-red'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {formatPercent(token.change24h)}
        </div>
      </div>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">平均价格</p>
          <p className="font-mono text-2xl font-bold text-white">${formatPrice(avgPrice)}</p>
        </div>
        <Sparkline data={token.priceHistory} width={110} height={40} />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-white/40">DEX 池价格对比</p>
        <div className="grid grid-cols-2 gap-2">
          {token.pools.map((pool) => (
            <div
              key={pool.pool}
              className="rounded-lg bg-bg-tertiary/60 px-3 py-2 border border-white/5"
            >
              <p className="text-[10px] text-white/50 font-medium">{pool.pool}</p>
              <p className="font-mono text-sm font-semibold text-white">${formatPrice(pool.price)}</p>
              <p className="text-[10px] text-white/30">池深: {formatLiquidity(pool.liquidity)}</p>
            </div>
          ))}
        </div>
      </div>

      {hasArbitrage && (
        <div className="mt-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30 px-3 py-2">
          <p className="text-xs font-semibold text-neon-gold text-glow-gold">
            ⚡ 检测到套利机会
          </p>
        </div>
      )}
    </div>
  );
}
