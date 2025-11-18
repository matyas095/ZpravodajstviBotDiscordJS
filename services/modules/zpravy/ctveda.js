//Imports
const { MessageFlags } = require("discord.js");
const scraperjs = require("scraperjs");
//

// Services
const zpravy_service = require("../../zpravy_service.js");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES;
const url = "https://ct24.ceskatelevize.cz/rubrika/veda-25";

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
             "veda", "ct24_veda", "a[href*=\"clanek\"]", isValidLink, MAX_TITLES, "ct24veda");
};

function isValidLink(link) {
    return link.includes("/clanek/") && !link.endsWith("/");
}