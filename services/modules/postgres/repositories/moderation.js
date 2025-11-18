const SuperRepository = require("./classes/SUPERRepository.js");

const creationSql = 
`

CREATE TABLE IF NOT EXISTS moderation
(
    id              SERIAL                   NOT NULL PRIMARY KEY,
    type            SMALLINT                 NOT NULL,
    target_id       BIGSERIAL                NOT NULL REFERENCES users (user_id),
    reason          TEXT                     NOT NULL,
    issued_by       BIGSERIAL                NOT NULL REFERENCES users (user_id),
    is_active       BOOLEAN                  NOT NULL DEFAULT TRUE,
    logs_message_id BIGSERIAL                NOT NULL,
    extra_storage   JSONB,
    created_at      timestamp with time zone  NOT NULL DEFAULT NOW(),
    updated_at      timestamp with time zone
);
    
`;

moderationTypes = {
    "Mute": 1,
    "Kick": 2,
    "Ban": 3
}

module.exports = class ModerationRepository extends SuperRepository {
    repository;
    constructor(pg_client, repository) {
        super(pg_client, repository, creationSql);
        
        this.pg_client = pg_client;
        this.repository = repository;
    };

    evalType(str) {
        return moderationTypes[str] || null;
    };

    /*builder() {
        const lines = creationSql.split(/\r?\n|\r|\n/g);
        const column = lines.map(f => f.replace(/^\s+/g,'').replace(/ .*//*,'')).filter(function(str) {
            if(["CREATE", ");", "("].includes(str)) return false;
            return /\S/.test(str);
        });

        const columns = column.map(f => {
            if (f.includes("_")) return f.substring(0, f.indexOf("_")) + 
                f.charAt(f.indexOf("_") + 1).toUpperCase() + 
                f.substring(f.indexOf("_") + 2);
            return f;
        });

        const clThis = this;

        const toReturn = {
            "sqlLine": { /*"repository": repoName*//* },
            "build": function() { clThis.build(toReturn) }
        };

        for(const COLUMN of columns) {
            toReturn[COLUMN] = function(arg) {
                toReturn.sqlLine[COLUMN] = arg
                return toReturn
            }
        }

        return toReturn;
    };*/
};