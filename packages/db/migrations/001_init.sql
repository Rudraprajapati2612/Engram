CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users(
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL ,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE conversations(
    id   UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title   TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


CREATE INDEX idx_conversations_user_id
ON conversations(user_id);

CREATE TABLE messages(
    id   UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
   type TEXT NOT NULL
    CHECK(type IN ('user','assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation
ON messages(conversation_id, created_at);

CREATE TABLE memories(
    id   UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    content  TEXT NOT NULL,

type TEXT NOT NULL
    CHECK(type IN ('fact','preference','event','relationship')),
    embedding VECTOR(768) NOT NULL,

    confidence FLOAT DEFAULT 0.8,

    active BOOLEAN DEFAULT TRUE,

    supersedes UUID
        REFERENCES memories(id)
        ON DELETE SET NULL,


    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- indexes
CREATE INDEX idx_memories_user_id
ON memories(user_id);

-- vector similarity search
CREATE INDEX memories_embedding_idx
ON memories
USING hnsw (embedding vector_cosine_ops);