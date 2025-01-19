CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Make nullable to add OAuth
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL  -- Multiple auth sessions allowed
        REFERENCES users(id) 
        ON DELETE CASCADE,
    session_token_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster session token lookups
CREATE INDEX idx_auth_sessions_token_hash ON auth_sessions(session_token_hash);

-- Extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE resource_nodes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    node_type TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add a spatial index to optimize geospatial queries
CREATE INDEX idx_location ON resource_nodes USING GIST(location);

-- Add a user_id index to optimize user based queries
CREATE INDEX idx_user_id ON resource_nodes (user_id);

CREATE TABLE user_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_count INT CHECK (item_count >= 1), -- Only for items with count
    metadata JSONB, -- Only for nonstackable items
    CHECK (
        (item_count IS NULL AND metadata IS NOT NULL) OR -- Nonstackable items
        (item_count IS NOT NULL AND metadata IS NULL)    -- Items with count
    )
);

-- Add a user_id index to optimize user based queries
CREATE INDEX idx_user_items_user_id ON user_items (user_id);

-- Stackable items only have one entry per type (per user)
CREATE UNIQUE INDEX unique_user_item_stackable
ON user_items (user_id, item_type)
WHERE item_count IS NOT NULL;
