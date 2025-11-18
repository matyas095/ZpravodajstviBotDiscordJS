// Imports
require("dotenv").config({ path: `../.env` });

//Exports
for (envState of Object.keys(process.env)) {
    // if(envState.includes(process.env.IDET_PRJ)) {
        module.exports[envState] = process.env[envState]
    // }
}