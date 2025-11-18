module.exports = 
`

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users
(
    id         UUID PRIMARY KEY                  DEFAULT gen_random_uuid(),
    user_id    BIGSERIAL                NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone
);

`;