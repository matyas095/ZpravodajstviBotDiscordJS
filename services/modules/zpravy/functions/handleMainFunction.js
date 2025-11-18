
const postgres_service = global.pathFinderOfService("postgres_service");
const zpravy_service = global.pathFinderOfService("zpravy_service");
const scraper_service = global.pathFinderOfService("scraper_service");

module.exports = async(interaction, toReCheck, url, channelName, redakceName, scrapingQuery, isValidLink, MAX_TITLES, isExempt) => {
    const channels = await zpravy_service.setupChannel(
        interaction,
        interaction === global.discordClient ? toReCheck : [],
        channelName
    );

    toReCheck = [];

    // když není žádný channel → ukonči
    if (channels.length === 0) return;

    // nahrání již existujících odkazů z DB
    const queryResult = await postgres_service.runQuery(
        `SELECT * FROM zpravy WHERE redakce='${redakceName}'`
    );
    const lastChecked = queryResult.rows[0]?.url ?? "null";

    // scrapnutí nových odkazů
    const uniqLinks = await scraper_service.scrapeWeb(
        url,
        scrapingQuery
    );

    // zpracování odkazů
    const promises = await zpravy_service.processLinks(
        uniqLinks,
        channels,
        toReCheck,
        lastChecked,
        zpravy_service.processLink,
        isValidLink,
        (new URL(url).pathname == "/") ? url : url.split(new URL(url).pathname)[0],
        isExempt
    );
    const processed = (await Promise.all(promises))
        .filter(item => item)
        .splice(0, MAX_TITLES);

    toReCheck = [];

    await zpravy_service.handlePromisedLinks(processed, toReCheck);

    if (toReCheck.length === 0 || processed.length === 0) return;

    // uložení do DB
    zpravy_service.update_tables_url_toReCheck(redakceName, [...new Set(toReCheck)]);
}