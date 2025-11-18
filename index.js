// Imports
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection,

    REST,
    Routes
} = require("discord.js");
const config = require("./config/config.js");

// Inits
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});
client.commands = new Collection();

// Defining Globals
global.rootDir = path.resolve(__dirname);
global.pathModule = path;
global.discordClient = client;
global.configEnves = config;
global.registeredUsers = [];
global.pathFinderOfService = (serviceName) => {
    const serviceFiles = fs.readdirSync(path.join(__dirname, 'services'))
                           .filter(file => file.split(".js")[0] == serviceName);

    if(!serviceFiles.length) throw new Error("Not found the service!");

    return require(`./services/${serviceFiles[0]}`);
};
global.returnPathToService = (serviceName) => {
    const serviceFiles = fs.readdirSync(path.join(__dirname, 'services'))
                           .filter(file => file.split(".js")[0] == serviceName);
    if(!serviceFiles.length) throw new Error("Not found the service!");

    return path.join(global.rootDir, `services/${serviceName}.js`);
}

// Services
const postgres_Service = require("./services/postgres_service.js");

// Init postgres db
postgres_Service.__init__();

// Main Functions
setTimeout(() => {
    const client_Service = require("./services/client_service.js");
    const zpravy_Service = require("./services/zpravy_service.js");
    client.login(config.TOKEN).then(() => {
        client_Service.__init__(client);

        zpravy_Service.__init__();
    });
}, 4000);
