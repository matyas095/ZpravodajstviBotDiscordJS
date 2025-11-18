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
const url = "https://www.idnes.cz/";

// Functions
const isValidLink = function (stringToCheck) {
    return (!stringToCheck.includes("?zdroj=patro") && !stringToCheck.includes("?zdroj=top") && !stringToCheck.includes("https://www.idnes.cz/sport") && stringToCheck.includes("https://www.idnes.cz/zpravy/") || stringToCheck.includes("https://www.idnes.cz/kultura/"));
}

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
             "cr", "idnes", "a[score-type*=\"Article\"]", isValidLink, MAX_TITLES);
}