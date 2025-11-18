//Imports
//

// Services
const postgres_service = global.pathFinderOfService("postgres_service");

module.exports = async () => {
    return
    const query = await postgres_service.runQuery(`
            SELECT * FROM USERS
    `)

    for(const row of query.rows) {
        global.registeredUsers.push(row.id)
    };

    return;
}