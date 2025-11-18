//Imports
const { MessageFlags } = require("discord.js");
const scraperjs = require("scraperjs");
//

// Services
const postgres_service = global.pathFinderOfService("postgres_service");
//const { processLink, update_tables_url_toReCheck } = require("../../zpravy_service.js") //global.pathFinderOfService("zpravy_service"); // NEFUNGUJE :(
const zpravy_service = require("../../zpravy_service.js");
const filterZpravy = require(global.pathModule.join(global.rootDir, "config/zpravy/filters/filterZpravy.js"));
const channels_Zpravy = require(global.pathModule.join(global.rootDir, "config/zpravy/channelsZpravy.js"));
const scraper_service = global.pathFinderOfService("scraper_service");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES;
const url = "https://www.foxnews.com";

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
             "svet", "foxnews", "[class*='title'] a", isValidLink, MAX_TITLES);
}

function isValidLink(link) {
    return link.includes("https://www.foxnews.com/politics/") || 
        link.includes("https://www.foxnews.com/us/") || 
        link.includes("https://www.foxnews.com/media/")
}