from asyncpg import Pool
from fastapi import  WebSocket


class WebSocketManager:
    def __init__(self):
        self.connections: dict[int, WebSocket] = {}  # user_id -> websocket

    async def connect(self, user_id: int, websocket: WebSocket):
        # Close old connection
        if user_id in self.connections:
            old_websocket = self.connections[user_id]
            try:
                await old_websocket.close(
                    code=1000, reason="Superseded by a new connection"
                )
                # RuntimeError is raised by uvicorn during handling of
                # starlette.websockets.WebSocketDisconnect
                # or websockets.exceptions.ConnectionClosedError
            except RuntimeError:
                # print(f"Old WebSocket for user {user_id} already closed")
                pass
        self.connections[user_id] = websocket

    async def disconnect(self, user_id: int):
        if user_id not in self.connections:
            print(f"User ({user_id}) not in manager (can't disconnect)")
            return
        websocket = self.connections[user_id]
        try:
            await websocket.close(
                code=1000, reason="User disconnected or session ended"
            )
        except RuntimeError:
            # print(f"WebSocket for user {user_id} was already closed")
            pass
        finally:
            # Race conditions can cause the key to be already deleted
            self.connections.pop(user_id, None)

    async def send_json(self, user_id: int, message: dict):
        websocket = self.connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except RuntimeError as e:
                print(f"Error sending data to user {user_id}: {e}")

    async def broadcast(self, message: dict):
        for user_id, websocket in self.connections.items():
            try:
                await websocket.send_json(message)
            except RuntimeError as e:
                print(f"Error sending data to user {user_id}: {e}")

    def get_db_pool(self, user_id: int) -> Pool:
        websocket = self.connections.get(user_id)
        if not websocket:
            raise RuntimeError(f"No active WebSocket connection for user {user_id}")
        return websocket.app.state.db_pool

