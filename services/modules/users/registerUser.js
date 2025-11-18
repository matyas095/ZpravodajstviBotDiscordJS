//Imports
//

// Services
//const client = require("../../postgres_service.js");  // global.pathFinderOfService("postgres_service");

module.exports = (userId) => {
    const client = require("../../postgres_service.js");
    client.pg_db_client.query(`
            INSERT INTO users(user_id) VALUES(${userId})
            ON CONFLICT DO NOTHING;
    `);

    global.registeredUsers.push(userId);
}