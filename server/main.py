from fastapi import FastAPI

app = FastAPI()


@app.get("/api")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/api/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "query": q}
