CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Make nullable to add OAuth
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL  -- Multiple auth sessions allowed
        REFERENCES users(id) 
        ON DELETE CASCADE,
    session_token_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE  -- One active game session per account
        REFERENCES users(id)
        ON DELETE CASCADE,
    auth_session_id INT NOT NULL
        REFERENCES auth_sessions(id)
        ON DELETE CASCADE,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster session token lookups
CREATE INDEX idx_auth_sessions_token_hash ON auth_sessions(session_token_hash);