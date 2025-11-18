module.exports =
`

CREATE TABLE IF NOT EXISTS warnings
(
    id              SERIAL                   NOT NULL PRIMARY KEY,
    target_id       BIGSERIAL                NOT NULL REFERENCES users (user_id),
    reason          TEXT                     NOT NULL,
    issued_by       BIGSERIAL                NOT NULL REFERENCES users (user_id),
    is_active       BOOLEAN                  NOT NULL DEFAULT TRUE,
    logs_message_id BIGSERIAL                NOT NULL,
    created_at      timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at      timestamp with time zone
);
    
`;