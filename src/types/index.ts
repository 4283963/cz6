export interface PoolPrice {
  pool: string;
  exchange: string;
  price: number;
  liquidity: number;
}

export interface PoolAnalysis {
  poolA: string;
  poolB: string;
  currentSpread: number;
  estimatedLifetime: string;
  opportunityType: string;
  confidence: number;
  spreadAvg: number;
  spreadStd: number;
  persistence: number;
  anomalyRatio: number;
}

export interface TokenPrice {
  symbol: string;
  name: string;
  icon: string;
  pools: PoolPrice[];
  change24h: number;
  priceHistory: number[];
  analysis: PoolAnalysis[];
}

export interface PricesResponse {
  timestamp: number;
  tokens: TokenPrice[];
}

export interface ArbitrageOpportunity {
  id: string;
  token: string;
  tokenName: string;
  buyPool: string;
  sellPool: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  estimatedProfit: number;
  timestamp: number;
  estimatedLifetime: string;
  opportunityType: string;
  confidence: number;
}
