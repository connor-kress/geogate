from contextlib import asynccontextmanager
from asyncpg import Pool
from fastapi import FastAPI, Request
from db.connection import get_db_pool
from db.items import get_user_inventory, insert_or_add_item
from middleware import init_middleware
from models import NodeType
from routes.auth import router as auth_router
from routes.nodes import router as nodes_router
from routes.session import router as session_router
from utils.nodes import get_node_item_drops


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


@app.get("/item-test")
async def item_test(request: Request, user_id: int):
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        new_items = get_node_item_drops(NodeType.ROCK_IRON)
        for item_type, count in new_items:
            await insert_or_add_item(conn, user_id, item_type, count)
        user_items = await get_user_inventory(conn, user_id)
    return {"newItems": new_items, "userItems": user_items}
