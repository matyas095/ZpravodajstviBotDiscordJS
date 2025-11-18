const scraperjs = require("scraperjs");

async function evalOutpust(output) {
    return [...new Set(output)];
}

module.exports = async(url, elementsToScrape) => {
    const output = await scraperjs.StaticScraper.create(url).scrape(function ($) {
        return $(elementsToScrape).map(function() {
            return $(this).attr("href");
        }).get();
    });

    return evalOutpust(output);
}