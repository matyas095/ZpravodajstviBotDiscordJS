// Imports
const fs = require('fs');
const path = require('path');

// Modules
const config = require("../config/config.js");

// Services
//const postgresService = require("./postgres_service.js");
const { CommandModules } = require("./postgres_service.js").repositories;

// Variables
const module_paths = path.join(global.rootDir, 'services/modules/users');

// Functions
async function _init_(client) {
    const repos = require("./postgres_service.js").repositories;
    
    const toPreFetchArray = config.USER_SERVICE_PRE_FETCH.split(",").filter(n => n);
    toPreFetchArray.push(config.DEV_HEAD_USER_ID);

    const toPreFetch = [...new Set(toPreFetchArray)];

    for(const idToFetch of toPreFetch) {
        module.exports.users.cache[idToFetch] = await client.users.fetch(idToFetch);
    }
}

async function findUser(userId) {
    if(module.exports.users.cache.hasOwnProperty(userId)) return module.exports.users.cache[userId];

    return await client.users.fetch(userId);
}

// Export
module.exports = {
   _init_: _init_,
   findUser: findUser,
   users: { cache: {} }
}

const files = fs.readdirSync(module_paths)
            .filter(file => file.endsWith('.js'))

for(const file of files) {
    module.exports[file.split(".js")[0]] = require(module_paths + "/" + file);
}