export function formatPrice(price: number): string {
  if (price < 0.0001) {
    return price.toExponential(4);
  }
  if (price < 0.01) {
    return price.toFixed(6);
  }
  if (price < 1) {
    return price.toFixed(4);
  }
  if (price < 100) {
    return price.toFixed(3);
  }
  return price.toFixed(2);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLiquidity(liq: number): string {
  if (liq >= 1_000_000) {
    return `$${(liq / 1_000_000).toFixed(2)}M`;
  }
  if (liq >= 1_000) {
    return `$${(liq / 1_000).toFixed(1)}K`;
  }
  return `$${liq.toFixed(0)}`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
