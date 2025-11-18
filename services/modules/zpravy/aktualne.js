// Imports
//

// Services
const zpravy_service = global.pathFinderOfService("zpravy_service");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES;
const url = "https://zpravy.aktualne.cz/domaci";
const elementsToScrape = '[data-ga4-type*="article"] a';

// Exported main function
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
         "cr", "aktualne", elementsToScrape, isValidLink, MAX_TITLES);

    // handleMainFunction(interaction, toReCheck, URL<String>,
    //                    channelName<String | Array>, redakceName<String>, scrapingQuery<String>, isValidLink<Function>)
};

// Helper: kontrola validního odkazu
function isValidLink(link) {
    return (
        link.includes("/domaci/") ||
        link.includes("/ekonomika/") ||
        link.includes("/spotlight/")
    );
}
