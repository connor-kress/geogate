from fastapi import WebSocket


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

    async def send_message(self, message: str, user_id: int):
        if user_id in self.connections:
            websocket = self.connections[user_id]
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        for websocket in self.connections.values():
            await websocket.send_text(message)
