const SuperRepository = require("./classes/SUPERRepository.js");

const creationSql = 
`

CREATE TABLE IF NOT EXISTS zpravy
(
    id      SERIAL      NOT NULL PRIMARY KEY,
    redakce VARCHAR(50) NOT NULL UNIQUE,
    url     VARCHAR[]   NOT NULL
);
    
`;


module.exports = class ZpravyRepository extends SuperRepository {
    constructor(pg_client, repository) {
        super(pg_client, repository, creationSql);
        
        this.pg_client = pg_client;
        this.repository = repository;
    };
};