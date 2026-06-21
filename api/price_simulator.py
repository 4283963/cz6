import asyncio
import math
import random
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List


TOKENS = [
    {"symbol": "SOL", "name": "Solana", "icon": "◎", "base_price": 165.50, "volatility": 0.008},
    {"symbol": "USDC", "name": "USD Coin", "icon": "◈", "base_price": 1.00, "volatility": 0.0005},
    {"symbol": "BONK", "name": "Bonk", "icon": "🐶", "base_price": 0.000025, "volatility": 0.035},
    {"symbol": "JTO", "name": "Jito", "icon": "◆", "base_price": 2.85, "volatility": 0.015},
    {"symbol": "WIF", "name": "Dogwifhat", "icon": "🐕", "base_price": 2.45, "volatility": 0.025},
    {"symbol": "JUP", "name": "Jupiter", "icon": "♃", "base_price": 0.78, "volatility": 0.018},
    {"symbol": "RAY", "name": "Raydium", "icon": "☀", "base_price": 0.95, "volatility": 0.02},
    {"symbol": "MEW", "name": "Cat in a Dogs World", "icon": "🐱", "base_price": 0.0068, "volatility": 0.03},
]

POOLS = [
    {"pool": "Raydium", "exchange": "Raydium", "spread": 0.002},
    {"pool": "Orca", "exchange": "Orca", "spread": 0.0015},
    {"pool": "Jupiter", "exchange": "Jupiter Aggregator", "spread": 0.001},
    {"pool": "Meteora", "exchange": "Meteora", "spread": 0.0025},
]

HISTORY_LENGTH = 30
LONG_HISTORY_LENGTH = 60


@dataclass
class TokenState:
    symbol: str
    name: str
    icon: str
    base_price: float
    volatility: float
    current_price: float = 0.0
    price_history: List[float] = field(default_factory=list)
    pool_prices: Dict[str, float] = field(default_factory=dict)
    pool_liquidity: Dict[str, float] = field(default_factory=dict)
    change24h: float = 0.0
    _start_price: float = 0.0

    def __post_init__(self):
        self.current_price = self.base_price
        self._start_price = self.base_price
        self.price_history = [self.base_price] * HISTORY_LENGTH
        self.pool_price_history: Dict[str, List[float]] = {}
        for pool_info in POOLS:
            pool = pool_info["pool"]
            self.pool_prices[pool] = self.base_price
            self.pool_price_history[pool] = [self.base_price] * LONG_HISTORY_LENGTH
            self.pool_liquidity[pool] = random.uniform(50000, 5000000)

    def update(self):
        drift = random.uniform(-1, 1) * self.volatility
        new_price = self.current_price * (1 + drift)
        min_price = self.base_price * 0.5
        max_price = self.base_price * 1.5
        new_price = max(min_price, min(max_price, new_price))
        self.current_price = new_price

        self.price_history.append(new_price)
        if len(self.price_history) > HISTORY_LENGTH:
            self.price_history.pop(0)

        self.change24h = ((new_price - self._start_price) / self._start_price) * 100

        for pool_info in POOLS:
            pool = pool_info["pool"]
            pool_spread = pool_info["spread"]
            extra_noise = random.uniform(-1, 1) * pool_spread * 3
            pool_price = new_price * (1 + extra_noise)
            self.pool_prices[pool] = pool_price
            self.pool_price_history[pool].append(pool_price)
            if len(self.pool_price_history[pool]) > LONG_HISTORY_LENGTH:
                self.pool_price_history[pool].pop(0)
            self.pool_liquidity[pool] *= random.uniform(0.995, 1.005)


token_states: Dict[str, TokenState] = {}


def init_tokens():
    for token_info in TOKENS:
        token_states[token_info["symbol"]] = TokenState(
            symbol=token_info["symbol"],
            name=token_info["name"],
            icon=token_info["icon"],
            base_price=token_info["base_price"],
            volatility=token_info["volatility"],
        )


def _to_safe_strings(obj: Any) -> Any:
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, int):
        return str(obj)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return "0"
        return str(obj)
    if isinstance(obj, dict):
        return {key: _to_safe_strings(value) for key, value in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_safe_strings(item) for item in obj]
    return obj


def _analyze_pair(buy_history: List[float], sell_history: List[float], current_spread: float) -> Dict[str, Any]:
    n = len(buy_history)
    spreads = []
    for i in range(n):
        b = buy_history[i]
        s = sell_history[i]
        if b <= 0 or s <= 0:
            continue
        low = min(b, s)
        high = max(b, s)
        spreads.append(((high - low) / low) * 100)

    if not spreads:
        return {
            "estimatedLifetime": "未知",
            "opportunityType": "普通机会",
            "confidence": 0.5,
            "spreadAvg": 0.0,
            "spreadStd": 0.0,
        }

    avg_spread = sum(spreads) / len(spreads)
    variance = sum((s - avg_spread) ** 2 for s in spreads) / len(spreads)
    std_spread = math.sqrt(variance)

    volatility = (std_spread / avg_spread) if avg_spread > 0 else 0

    above_threshold_count = sum(1 for s in spreads if s >= current_spread)
    persistence = above_threshold_count / len(spreads)

    anomaly_ratio = (current_spread / avg_spread) if avg_spread > 0 else 1.0

    if volatility > 1.5 or anomaly_ratio > 3:
        lifetime = "秒级消失"
    elif volatility > 0.8:
        lifetime = "分钟级"
    else:
        lifetime = "较持久"

    if anomaly_ratio > 2.5 and persistence < 0.2 and volatility < 2:
        opp_type = "黄金机会"
    elif anomaly_ratio > 1.5 and persistence < 0.4:
        opp_type = "普通机会"
    elif volatility > 2 and persistence < 0.15:
        opp_type = "诱多陷阱"
    elif persistence > 0.6:
        opp_type = "常态差异"
    else:
        opp_type = "普通机会"

    confidence = min(1.0, max(0.2, 1.0 - volatility * 0.3))

    return {
        "estimatedLifetime": lifetime,
        "opportunityType": opp_type,
        "confidence": confidence,
        "spreadAvg": avg_spread,
        "spreadStd": std_spread,
        "persistence": persistence,
        "anomalyRatio": anomaly_ratio,
    }


def _build_analysis(state: TokenState) -> List[Dict[str, Any]]:
    analysis_list = []
    pool_names = [p["pool"] for p in POOLS]
    for i in range(len(pool_names)):
        for j in range(i + 1, len(pool_names)):
            pool_a = pool_names[i]
            pool_b = pool_names[j]
            hist_a = state.pool_price_history.get(pool_a, [])
            hist_b = state.pool_price_history.get(pool_b, [])
            price_a = state.pool_prices.get(pool_a, 0)
            price_b = state.pool_prices.get(pool_b, 0)
            if price_a <= 0 or price_b <= 0:
                continue
            low = min(price_a, price_b)
            high = max(price_a, price_b)
            current_spread = ((high - low) / low) * 100
            analysis = _analyze_pair(hist_a, hist_b, current_spread)
            analysis_list.append({
                "poolA": pool_a,
                "poolB": pool_b,
                "currentSpread": current_spread,
                **analysis,
            })
    return analysis_list


def get_all_prices():
    result = []
    for symbol, state in token_states.items():
        pools = []
        for pool_info in POOLS:
            pool_name = pool_info["pool"]
            pools.append({
                "pool": pool_name,
                "exchange": pool_info["exchange"],
                "price": state.pool_prices[pool_name],
                "liquidity": state.pool_liquidity[pool_name],
            })
        result.append({
            "symbol": state.symbol,
            "name": state.name,
            "icon": state.icon,
            "pools": pools,
            "change24h": state.change24h,
            "priceHistory": state.price_history.copy(),
            "analysis": _build_analysis(state),
        })
    return _to_safe_strings({
        "timestamp": int(time.time() * 1000),
        "tokens": result,
    })


def get_tokens_list():
    return [
        {
            "symbol": t["symbol"],
            "name": t["name"],
            "icon": t["icon"],
        }
        for t in TOKENS
    ]


async def price_simulation_loop():
    init_tokens()
    while True:
        for state in token_states.values():
            state.update()
        await asyncio.sleep(0.8)
