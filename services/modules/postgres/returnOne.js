module.exports = function() {
    /*

    returnOne("TABLE_NAME", {
        COLUMN: "WHAT_COLUMN_TO_FIND_IN",
        VALUE: "WHAT_TO_FIND"
    })

    */
    return async(table, value) => {
        if(!Object.keys(value).includes("COLUMN")) throw new Error("Špatný JSON parametr pro #1 Value COLUMN");
        if(!Object.keys(value).includes("VALUE")) throw new Error("Špatný JSON parametr pro #2 Value VALUE");

        const query = await this.pg_db_client.query(`SELECT * FROM ${table} WHERE ${value.COLUMN}=${value.VALUE};`);

        return query.rows
    }
};