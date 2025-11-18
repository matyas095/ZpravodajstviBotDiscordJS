module.exports =
`

CREATE TABLE IF NOT EXISTS zpravy
(
    id      SERIAL      NOT NULL PRIMARY KEY,
    redakce VARCHAR(50) NOT NULL UNIQUE,
    url     VARCHAR[]   NOT NULL
);
    
`;