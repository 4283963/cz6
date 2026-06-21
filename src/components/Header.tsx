import { Activity, RefreshCw, Clock, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatTime } from '@/utils/format';

interface HeaderProps {
  refreshInterval: number;
  onIntervalChange: (interval: number) => void;
  lastUpdate: number | null;
  isConnected: boolean;
}

const INTERVAL_OPTIONS = [
  { label: '2 秒', value: 2000 },
  { label: '3 秒', value: 3000 },
  { label: '5 秒', value: 5000 },
  { label: '10 秒', value: 10000 },
];

export default function Header({
  refreshInterval,
  onIntervalChange,
  lastUpdate,
  isConnected,
}: HeaderProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-card-strong rounded-2xl px-6 py-4 mb-6 border-b border-white/5 sticky top-4 z-50">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-neon-purple">
              <Activity className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-neon-green border-2 border-bg-primary animate-pulse-glow" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              Solana <span className="text-neon-purple text-glow-purple">DEX</span> 套利监控
            </h1>
            <p className="text-xs text-white/40">实时追踪跨池价格差异 · DeFi Arbitrage Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Wifi size={14} className={isConnected ? 'text-neon-green' : 'text-neon-red'} />
            <span className={`text-xs font-medium ${isConnected ? 'text-neon-green' : 'text-neon-red'}`}>
              {isConnected ? '已连接' : '断开'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Clock size={14} />
            <span className="font-mono text-sm text-white">{formatTime(now)}</span>
          </div>

          {lastUpdate && (
            <div className="flex items-center gap-2 text-white/60">
              <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs">最后更新: {formatTime(lastUpdate)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">刷新频率</span>
            <select
              value={refreshInterval}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
              className="bg-bg-tertiary border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-neon-purple transition-colors"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
