import { ArrowRight, Zap, TrendingUp } from 'lucide-react';
import type { ArbitrageOpportunity } from '@/types';
import { formatPrice, formatPercent, formatTime } from '@/utils/format';

interface ArbitrageCardProps {
  opp: ArbitrageOpportunity;
}

export default function ArbitrageCard({ opp }: ArbitrageCardProps) {
  return (
    <div className="arbitrage-border glass-card-strong rounded-xl p-5 shadow-neon-gold relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-gold/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-gold/20">
              <Zap className="text-neon-gold" size={18} />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-lg">
                {opp.token} <span className="text-white/50 text-sm font-normal">{opp.tokenName}</span>
              </h4>
              <p className="text-[10px] text-white/40">{formatTime(opp.timestamp)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/40">价差</p>
            <p className="font-mono font-bold text-2xl text-neon-gold text-glow-gold animate-pulse-glow">
              {formatPercent(opp.spreadPercent)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl bg-bg-tertiary/80 px-4 py-3 border border-white/5">
          <div className="flex-1">
            <p className="text-[10px] text-neon-green uppercase tracking-wider mb-0.5">买入 · {opp.buyPool}</p>
            <p className="font-mono text-lg font-bold text-neon-green">${formatPrice(opp.buyPrice)}</p>
          </div>
          <div className="px-2">
            <ArrowRight className="text-neon-gold" size={24} />
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] text-neon-red uppercase tracking-wider mb-0.5">卖出 · {opp.sellPool}</p>
            <p className="font-mono text-lg font-bold text-neon-red">${formatPrice(opp.sellPrice)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-neon-gold" size={14} />
            <span className="text-xs text-white/60">预估利润 (以 1000 USDC 计)</span>
          </div>
          <p className="font-mono font-bold text-neon-gold text-glow-gold">
            +${opp.estimatedProfit.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
