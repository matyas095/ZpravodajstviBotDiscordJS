module.exports = function() {
    return async() => {
        const dropSqlQuery = "DROP SCHEMA public CASCADE;"
                           + "CREATE SCHEMA public;";

        await this.pg_db_client.query(dropSqlQuery);

        const granPermissionsForSchemaPublic = "GRANT ALL ON SCHEMA public TO matyas095;"
                                             + "GRANT ALL ON SCHEMA public TO public;";

        await this.pg_db_client.query(granPermissionsForSchemaPublic);

        console.log("=== SUCCESSFULY DROPPED AND CREATED SCHEMA PUBLIC ===")
    };
};