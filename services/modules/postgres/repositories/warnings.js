const SuperRepository = require("./classes/SUPERRepository.js");

const creationSql = 
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


module.exports = class WarningsRepository extends SuperRepository {
    constructor(pg_client, repository) {
        super(pg_client, repository, creationSql);
        
        this.pg_client = pg_client;
        this.repository = repository;
    };
};