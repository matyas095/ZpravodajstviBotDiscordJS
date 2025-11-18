const SuperRepository = require("./classes/SUPERRepository.js");

const creationSql = 
`

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users
(
    id         UUID PRIMARY KEY                  DEFAULT gen_random_uuid(),
    user_id    BIGSERIAL                NOT NULL UNIQUE,
    chat_xp    INTEGER                  NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone
);

`;


module.exports = class UsersRepository extends SuperRepository {
    constructor(pg_client, repository) {
        super(pg_client, repository, creationSql);
        
        this.pg_client = pg_client;
        this.repository = repository;
    };


};