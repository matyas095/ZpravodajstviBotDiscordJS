const SuperRepository = require("./classes/SUPERRepository.js");

const creationSql = 
`

CREATE TABLE IF NOT EXISTS command_modules
(
    id         SERIAL                      NOT NULL PRIMARY KEY,
    func_name  VARCHAR(100)                NOT NULL UNIQUE,
    func_text  BYTEA                       NOT NULL,
    deployed   BOOLEAN                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone
);
    
`;


module.exports = class CommandModules extends SuperRepository {
    constructor(pg_client, repository) {
        super(pg_client, repository, creationSql);
        
        this.pg_client = pg_client;
        this.repository = repository;
    };
};