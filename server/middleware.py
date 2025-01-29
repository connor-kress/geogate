from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def init_middleware(app: FastAPI):
    allowed_origins = [
        "http://localhost:8081",  # Frontend's URL
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
