import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from price_simulator import get_all_prices, get_tokens_list, price_simulation_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(price_simulation_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Solana DEX Arbitrage Monitor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "solana-arbitrage-monitor"}


@app.get("/api/tokens")
async def tokens():
    return get_tokens_list()


@app.get("/api/prices")
async def prices():
    return get_all_prices()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
