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
const url = "https://www.idnes.cz/sport";

// Functions
const isValidLink = function (stringToCheck) {
    return stringToCheck.includes("https://www.idnes.cz/sport");
}

// Exports
module.exports = async (interaction, toReCheck) => {
    return; // NEFUNKČNÍ
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
             "cr", "idnes_sport", "div a", isValidLink, MAX_TITLES, "idnessport");
}