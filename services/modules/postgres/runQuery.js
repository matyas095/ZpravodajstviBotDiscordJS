module.exports = function() {
    return async(query) => { return await this.pg_db_client.query(query); }
};