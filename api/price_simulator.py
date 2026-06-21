import asyncio
import random
import time
from dataclasses import dataclass, field
from typing import Dict, List


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
        for pool_info in POOLS:
            pool = pool_info["pool"]
            self.pool_prices[pool] = self.base_price
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
            self.pool_prices[pool] = new_price * (1 + extra_noise)
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
        })
    return {
        "timestamp": int(time.time() * 1000),
        "tokens": result,
    }


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
