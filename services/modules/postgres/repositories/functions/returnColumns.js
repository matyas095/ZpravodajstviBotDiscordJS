/**
 * Returns Columns without _, replaces with Capital Letter the next Character after _
 * @function
 * @param {String} creationSql               - User to DM
 * @returns {Array}                          - Returns mapped Array of Columns
 */

const dbTypes = {
    SMALLINT: Number,
    INTEGER: Number,
    SERIAL: Number,
    BIGSERIAL: Number,

    VARCHAR: String,
    TEXT: String,

    BYTEA: Object,
    JSONB: Object,
    UUID: Object,

    BOOLEAN: Boolean,

    timestamp: Date,
    timestampz: Date,
};

module.exports = function(creationSql) {
    return (creationSql.match(/^ (.*)$/gm) || [])
        .map(line => line.match(/\w+/g))
        .filter(parts => parts && parts.length >= 2)
        .map(([first, second]) => ({
            name: first.replace(/_([A-Za-z0-9])/g, (_, c) => c.toUpperCase()),
            type: second,
            typeObject: dbTypes[second.match(/^([\w\-]+)/g)[0]],

            properName: first
        }));
};