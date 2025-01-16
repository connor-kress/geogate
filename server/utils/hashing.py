import base64
import hashlib


def hash_sha256(__a: str) -> str:
    """Returns a base 64 encoded sha256 hash of a string."""
    raw_hash = hashlib.sha256(__a.encode()).digest()
    return base64.b64encode(raw_hash).decode()
