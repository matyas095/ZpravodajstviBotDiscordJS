// Imports
const {
    ActivityType,
    PresenceUpdateStatus,
    Events
} = require('discord.js');

// Modules
const postgres_Service = require("../../postgres_service.js");
const commands_Service = require("../../commands_service.js");
const userService = require("../../user_service.js");
const config = require("../../../config/config.js");

const SongPlayer = require("../../song_service.js");

// Variables
const activityTypeMap = {
    "PLAYING": ActivityType.Playing,
    "WATCHING": ActivityType.Watching,
    "LISTENING": ActivityType.Listening,
    "STREAMING": ActivityType.Streaming,
    "COMPETING": ActivityType.Competing
};

const statusMap = {
    "online": PresenceUpdateStatus.Online,
    "idle": PresenceUpdateStatus.Idle,
    "dnd": PresenceUpdateStatus.DoNotDisturb,
    "invisible": PresenceUpdateStatus.Invisible
};

// Functions
function setPresent(client, conf) {
    client.user.setPresence(conf);
};

function runPresentPeriodic(client) {
    (() => {
        if(!config.ACTIVITY_NAME || config.DEV_IS_DEV_MODE_ON === "TRUE") return;

        let end = config.ACTIVITY_NAME.split(",").length - 1;

        function coroutine(counter) {
            client.user.setPresence({
                status: statusMap[config.DEV_IS_DEV_MODE_ON === "TRUE" ? "dnd" : (config.BOT_STATUS || 'online')],
                activities: [{
                    name: config.ACTIVITY_NAME.split(",")[counter].split("%43=")[0],
                    type: activityTypeMap[config.ACTIVITY_NAME.split(",")[counter].split("%43=")[1]]
                }]
            });

            if(counter < end) return setTimeout(function() { coroutine(counter + 1) }, 20 * 1000);
            if(counter >= end) return setTimeout(function() { coroutine(0) }, 20 * 1000);
        };
        coroutine(0);
    })();
};


// Export
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        client.utils = {
            audioQueue: {}
        };

        this.client = client;
        //const statusType = config.BOT_STATUS || 'online';
        const statusType = config.DEV_IS_DEV_MODE_ON === "TRUE" ? "dnd" : (config.BOT_STATUS || 'online');
        //let activityName = config.ACTIVITY_NAME.split(",")[0].split("%43=")[0] || 'Discord';
        const activityName = config.DEV_IS_DEV_MODE_ON === "TRUE" ? 
            "Development mode nahozen - nefungujou commandy mimo developery" : 
            (config.ACTIVITY_NAME.split(",")[0].split("%43=")[0] || 'Discord');
        //let activityType = config.ACTIVITY_NAME.split(",")[0].split("%43=")[1] || 'PLAYING';
        const activityType = config.DEV_IS_DEV_MODE_ON === "TRUE" ?
         "WATCHING" :
         (config.ACTIVITY_NAME.split(",")[0].split("%43=")[1] || 'PLAYING');
    
        setPresent(client, {
            status: statusMap[statusType],
            activities: [{
                name: activityName,
                type: activityTypeMap[activityType]
            }]
        });

        runPresentPeriodic(client);
        
        console.log(`Bot runtime up ${new Date()}`);
    
        // Cascade all tables in db (IN .env SET POSTGRES_DB_DROP_ON_INIT TO TRUE)
        if(config.POSTGRES_DB_DROP_ON_INIT === "TRUE") {
            postgres_Service.__DROP_ALL_TABLES_and_CREATE_SCHEMA__();
            console.log("=====    SCHEMA DROPPED    =====");
        };
    
        //Deploy Commands
        await commands_Service.deployCommands();

        // Register users to global (conflict mittigation)
        //await user_service.__init__registerUsers_on_init__();
    
        // Load Commands
        const commandFiles = await commands_Service.loadCommands(client.commands);
        client.commands = commandFiles;
        console.log(`Commands loaded globally.`);
        
		console.log(`Ready! Logged in as ${client.user.tag}`);

        userService._init_(client);

        const guilds = await client.guilds.fetch();
        guilds.forEach(guild => {
            client.utils.audioQueue[guild.id] = new SongPlayer(client);
        });
	},
};