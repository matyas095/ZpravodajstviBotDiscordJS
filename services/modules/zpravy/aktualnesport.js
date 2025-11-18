//Imports
//

// Services
const zpravy_service = require("../../zpravy_service.js");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES;
const url = "https://sport.aktualne.cz";
const elementsToScrape = '[data-ga4-type*="article"] a';

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
         "sport", "aktualne_sport", '[data-ga4-type*="article"] a', isValidLink, MAX_TITLES, "aktualnesport");
};

function isValidLink(link) {
    return link.includes("/sport/") || link.includes("/podcasty/") || link.includes("/ostatni-sporty/") ||
        link.includes("/hokej/") || link.includes("/fotbal/");
}