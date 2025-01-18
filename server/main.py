from contextlib import asynccontextmanager
from fastapi import FastAPI
from db.connection import get_db_pool
from middleware import init_middleware
from routes.auth import router as auth_router
from routes.nodes import router as nodes_router
from routes.session import router as session_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_pool = await get_db_pool()
    app.state.db_pool = db_pool
    try:
        yield
    finally:
        await db_pool.close()


app = FastAPI(lifespan=lifespan)
init_middleware(app)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(nodes_router, prefix="/nodes", tags=["nodes"])
app.include_router(session_router, prefix="/session", tags=["session"])


@app.get("/")
async def get_root():
    return {"message": "This is an API"}
