const Column = require("./Column.js");
const Row = require("./Row.js");
const returnColumns = require("../functions/returnColumns.js");
const returnColumnsReverse = require("../functions/returnColumnsReverse.js");

function constructForBuilder() {

};

// Class
/**
 * SuperRepository class that handles most of the functions.
 * @classdesc Super Repository holds and handles the very basic performances of individual repositories.
 */
class SUPERRepository {
    /**
     * Super constructed from individual repositories.
     * @constructor
     * @param {PostgresClient} pg_client - Database Client Postgres-based.
     * @param {String} repo              - The name of the repository.
     * @param {String} creationSql       - SQL-based String of TABLE CREATE.
     */
    constructor(pg_client, repo, creationSql) {
        this.pg_client = pg_client;
        this.repository = repo;
        this.creationSql = creationSql;

        this.cache = {}
        this.columns = {}

        this.query(creationSql);

        setInterval(() => { this.cache = {} }, 10 * 60 * 1000); // Každých 10 minut

        const columns_without__ = returnColumns(this.creationSql); // Without _
        const columns_with__ = columns_without__.map(f => f.name.replace(/[A-Z][a-z]*/g, str => "_" + str.toLowerCase())); // With _

        this.columns_without__ = columns_without__;
        this.columns_with__ = columns_with__;

        for(const column of columns_without__) {
            this.columns[column.name] = new Column(this, this.repository, column);
        };
    };

    #cacheing(key, obj) {
        if(Object.keys(this.cache).includes(key)) return;

        this.cache[key] = obj;
    };

    /**
     * Runs a SQL-based query on the Client.
     * @function
     * @param {String} line - SQL-based line(s) that is/are executed.
     * @returns {Query}     - The result of an query.
     */
    query(line) {
        return this.pg_client.query(line);
    };

    /**
     * Returns everything from the table repository.
     * @function
     * @returns {Array}     - Rows in an Array.
     */
    selectAll() {
        return this.query(`SELECT * FROM ${this.repository}`).then(q => { return q.rows });
    };

    /**
     * Returns a row from Repository, under conditions
     * @function
     * @param {*} ...args                - { { COLUMN: VALUE }, ...}
     * @returns {Object | undefined}     - The found object OR undefined if not found.
     */
    selectOne(...arg) {
        return this.query(`SELECT * FROM ${this.repository} WHERE ${arg.map(val => Object.keys(val).map(f => `${f}='${val[f]}'`).join(" AND ")).join("")};`)
            .then(q => { if(q.rows.length === 0) return []; return q.rows[0] });
    };

    /**
     * Returns rows from Repository, under conditions
     * @function
     * @param {*} ...args                - { { COLUMN: VALUE }, ...}
     * @returns {Array}                  - Array of found rows.
     */
    selectMany(...arg) {
        return this.query(`SELECT * FROM ${this.repository} WHERE ${arg.map(f => `${Object.keys(f)[0]}='${Object.values(f)[0]}'`).join(" AND ")};`)
            .then(q => { return q.rows });
    };

    /**
     * Runs a query on INSERT condition - creates row and inserts on the provided columns.
     * @function
     * @param {Array} COLUMNs               - To what columns are we inserting into.
     * @param {Array} VALUEs                - What values are we inserting.
     * @returns {Query}                     - The found object OR undefined if not found.
     */
    insert(COLUMNs, VALUEs) {
        return this.query({
            text: 
            `
                INSERT INTO ${this.repository}(${COLUMNs.join(", ")})
                VALUES (${[...COLUMNs.keys()].map(f => "$" + (f + 1))})
                ON CONFLICT DO NOTHING;
            `,
            values: VALUEs
        });
    };

    /**
     * Updates a row on conditions.
     * @function
     * @param {Object} UPDATING_ROWS               - What are we updating { { COLUMN: VALUE }, ...}
     * @param {Object} ROW                         - Conditional row.
     * @returns {Query}                            - Updated query.
     */
    update(UPDATING_ROWS, ROW) {
        if(!ROW.hasOwnProperty("COLUMN")) throw new Error("V #3 argumentu 'ROW' chybí JSON položka 'COLUMN'");
        if(!ROW.hasOwnProperty("VALUE")) throw new Error("V #3 argumentu 'ROW' chybí JSON položka 'VALUE'");

        for(const key of Object.keys(UPDATING_ROWS)) {
            if(UPDATING_ROWS[key] instanceof Date) UPDATING_ROWS[key] = "now()";
        };

        return this.query(
            `
				UPDATE ${this.repository}
                SET ${Object.keys(UPDATING_ROWS).map(f => `${f} = '${UPDATING_ROWS[f]}'`).join(", ")}
                WHERE ${ROW.COLUMN} = ${ROW.VALUE};
			`
        );
    };
    
    /**
     * Pushes contents into an array in DB.
     * @function
     * @param {Array} COLUMNs                               - What are we updating
     * @param {Object} VALUEs                               - What are updating
     * @param {Object} whatToAppend                         - What ARRAY object in TABLE are we appending to.
     * @returns {Query}                                     - Updated query.
     */
    appendArray(COLUMNs, VALUEs, whatToAppend) {
        return this.query({
            text: `
				INSERT INTO ${this.repository} (${COLUMNs.join(", ")})
				VALUES (${[...COLUMNs.keys()].map(f => "$" + (f + 1))})
				ON CONFLICT DO UPDATE
				SET ${whatToAppend} = array_append(${this.repository}.${whatToAppend}, $${COLUMNs.length + 1});
			`,
			values: VALUEs
        });
    };

    /**
     * Initializes new row.
     * @function
     * @returns {Object} - SET Functions and .build() function to construct and INSERT the new row.
     * 
     * @example
     * ModerationRepository.builder()
		    .targetId(716211977210560532n)
		    .reason("ye")
		    .issuedBy(716211977210560532n)
		    .type(2)
		    .logsMessage_id(24241)
		    .build();
     */
    builder() {
        const columns = this.columns_without__;
        const clThis = this;

        const toReturn = {
            "sqlLine": {},
            "build": function() { 
                const [COLUMNs, VALUEs] = returnColumnsReverse(this.sqlLine);

                return clThis.insert(COLUMNs, VALUEs);
            }
        };

        for(const COLUMN of columns) {
            toReturn[COLUMN[0]] = function(arg) {
                toReturn.sqlLine[COLUMN[0]] = arg
                return toReturn
            };
        };

        return toReturn;
    };

    /**
     * Finds a new row using builder tactic.
     * @function
     * @returns {Promise<Object>} - SET Functions and .execute() function to execute SELECT operation.
     * 
     * @example
     * ModerationRepository.find()
                    .targetId(716211977210560532n)
                    .type(2)
                    .execute().then(q => { console.log(q) });
     */
    find() {
        const toReturn = {
            "sqlLine": {},
            "execute": async() => {
                if(Object.keys(toReturn.sqlLine).length == 0) throw new Error("Can't find anything if its empty!");

                return new Row(this, this.repository, await this.selectOne(toReturn.sqlLine), this.columns);
            }
        };

        for(const COLUMN of Object.values(this.columns)) {
            toReturn[COLUMN.name] = function(arg) {
                toReturn.sqlLine[COLUMN.properName] = arg
                return toReturn;
            };
        };

        return toReturn;
    };

    select(whatToSelect) {
        whatToSelect = whatToSelect?.length > 0 ? [].concat(whatToSelect)
                                            //.map(f => `'${f}'`) 
                                            : ["*"];

        const toReturn = {
            "sqlLine": {},
            "execute": async() => {
                //if(Object.keys(toReturn.sqlLine).length == 0) throw new Error("Can't find anything if its empty!");

                const sql = 
                `
                SELECT ${whatToSelect} FROM ${this.repository} ${Object.keys(toReturn.sqlLine).length > 0
                    ? "WHERE " + Object.keys(toReturn.sqlLine).map(f => `${f}='${toReturn.sqlLine[f]}'`).join(" AND ") : ""};
                `;
                const rows = (await this.query(sql)).rows;

                return rows.map(f => new Row(this, this.repository, f, this.columns));
            }
        };

        constructForBuilder();
        for(const column of this.columns_without__) {
            toReturn[column.name] = function(arg) {
                toReturn.sqlLine[column.properName] = arg;
                return toReturn;
            };
        };


        return toReturn;
    };

    /**
     * Sets a Column by a Value. 
     * @function
     * @param   {Object}          COLUMN_VALUE - Setters.
     * @param   {Object}          IDENT        - Identification for row.
     * @returns {Promise<Object>}              - SET Functions and .execute() function to execute SELECT operation.
     * 
     * @example
     * <Repository>.setColumn({
     *      COLUMN: "XP",
     *      VALUE: 4
     * }, {
     *      COLUMN: "ID",
     *      VALUE: 298239481241
     * })
     */
    setColumn(COLUMN_VALUE, IDENT) {
        return this.query(
            `
				UPDATE ${this.repository}
				SET ${COLUMN_VALUE.COLUMN}=${COLUMN_VALUE.VALUE}
				WHERE ${IDENT.COLUMN}=${IDENT.VALUE}
			`
        );
    };
};

// Exports
module.exports = SUPERRepository;