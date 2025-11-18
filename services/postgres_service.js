// Imports
const pg = require("pg");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require('discord.js');

// Modules
const config = require("../config/config.js");

// Inits
const pg_db_client = new pg.Client(`postgres://${config.POSTGRES_DB_USERNAME}:${config.POSTGRES_DB_PASSWORD}` 
                            +    `@${config.POSTGRES_DB_HOSTNAME}:${config.POSTGRES_DB_PORT}`
                            +    `/${config.POSTGRES_DB_DATABASES.split(",")[0]}`);
pg_db_client.connect();

// Variables
//global.rootDir = path.resolve(__dirname).replace("\services", ""); // TO-DELETE ON IMPL
global.pg_db_client = pg_db_client;

const module_path = path.join(global.rootDir, "services/modules/postgres");
const tables_path = path.join(module_path, "tables");
const repository_path = path.join(module_path, "repositories");

// Runnables
module.exports.repositories = {};
listRepositories()

function listRepositories() {
   const repositories = fs.readdirSync(repository_path).filter(file => file.endsWith('.js'));

   const priorityFiles = ["users.js"]; // jde to od zadu, takže pokud za users.js je třeba zpravy.js, tak jdou zpravy.js pak users.js

   for(const repoFile of Object.values(repositories).sort(function(x, y) { return priorityFiles.includes(x) ? -1 : y == priorityFiles.find(f => f == x) ? 1 : 0; } )) {
        const Repo = require(repository_path + "/" + repoFile);
        if(repoFile.includes(".disabled")) continue;
        module.exports.repositories[Repo.name] = new Repo(pg_db_client, repoFile.replace(".js", ""));
   };

   return;
};

// Services
const userService = global.pathFinderOfService("user_service");

// Exports
module.exports.pg_db_client = pg_db_client;
module.exports.path = path;
module.exports.__init__ = function() {
    const scripts = fs.readdirSync(module_path).filter(file => file.endsWith('.js'));
    const tables = fs.readdirSync(tables_path).filter(file => file.endsWith('.js'));

    for(const scriptFile of scripts) {
        const script = require(module_path + "/" + scriptFile).call(this);
        module.exports[scriptFile.replace(".js", "")] = script;
    };
    /* for(const tableFile of tables) {
        const table = require(tables_path + "/" + tableFile);
        pg_db_client.query(table);
    }; */
    //listRepositories()

    pg_db_client.on("error", err => {
        userService.users.cache[config.DEV_HEAD_USER_ID].send("Error");
        const embed = new EmbedBuilder()
            .setColor(15091763)
            .setTitle("Chybová hláška")
            .setDescription(`${err}`)
            .setTimestamp();

        userService.users.cache[config.DEV_HEAD_USER_ID].send({ embeds: [embed] });
    });

    pg_db_client.on("end", () => {
        userService.users.cache[config.DEV_HEAD_USER_ID].send("PG_END");
        const embed = new EmbedBuilder()
            .setColor(1316377)
            .setTitle("Postgres Client byl ukončen")
            .setDescription(`PG Client.end(); nebo Error stack`)
            .setTimestamp();

        userService.users.cache[config.DEV_HEAD_USER_ID].send({ embeds: [embed] });
    });
}