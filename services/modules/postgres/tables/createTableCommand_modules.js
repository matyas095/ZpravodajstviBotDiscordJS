module.exports =
`

CREATE TABLE IF NOT EXISTS command_modules
(
    id         serial                      NOT NULL PRIMARY KEY,
    func_name  VARCHAR(100)                NOT NULL UNIQUE,
    func_text  bytea                       NOT NULL,
    deployed   BOOLEAN                     NOT NULL DEFAULT FALSE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp without time zone
);

`;