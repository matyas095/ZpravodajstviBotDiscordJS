//Imports
const { MessageFlags } = require("discord.js");
const scraperjs = require("scraperjs");
//

// Services
const postgres_service = global.pathFinderOfService("postgres_service");
//const { processLink, update_tables_url_toReCheck } = require("../../zpravy_service.js") //global.pathFinderOfService("zpravy_service"); // NEFUNGUJE :(
const zpravy_service = require("../../zpravy_service.js");
const channels_Zpravy = require(global.pathModule.join(global.rootDir, "config/zpravy/channelsZpravy.js"));
const scraper_service = global.pathFinderOfService("scraper_service");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES + 5;
const url = "https://ct24.ceskatelevize.cz/rubrika/pocasi-27";

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
         "pocasi", "ct_pocasi", "a[class*=\"article-link__link\"]", isValidLink, MAX_TITLES, "ct_pocasi");
    /*let channel;
    let channelVeda;
    if(interaction === global.discordClient) {
        interaction = toReCheck;
        toReCheck = [];

        channel = interaction.channels.cache.get(channels_Zpravy["pocasi"]);
        channelVeda = interaction.channels.cache.get(channels_Zpravy["pocasi"]);
    } else {
        interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });

        channel = await interaction.member.guild.channels.cache.get(channels_Zpravy["pocasi"]);
        channelVeda = await interaction.member.guild.channels.cache.get(channels_Zpravy["pocasi"]);
    }
    if(!channel) return;
 
    const url = "https://ct24.ceskatelevize.cz/rubrika/pocasi-27";

    let arrayQueryToCheck = await postgres_service.runQuery("SELECT * FROM zpravy WHERE redakce='ct_pocasi'");
    arrayQueryToCheck.rows[0] ??= { url: "null" };

    scraperjs.StaticScraper.create(url).scrape(function ($) {
        return $("a[class*=\"article-link__link\"]").map(function () {
            return $(this).attr("href")
        }).get();
    }).then(async (r) => {
        const uniq = [...new Set(r)];
        let promises = [];

        for (const link of uniq) {
        const uniq = [...new Set(r)];
        let promises = [];

        for (const link of uniq) {
            if (isValidLink(link) && !link.includes("/veda/")) {
                const fullLink = link.includes("https://") ? link : "https://ct24.ceskatelevize.cz" + link + "///POCASI";
                promises.push(zpravy_service.processLink(fullLink, channel, toReCheck, arrayQueryToCheck.rows[0].url));
            } else if(link.includes("/veda/")){
                const fullLink = link.includes("https://") ? link : "https://ct24.ceskatelevize.cz" + link + "///POCASI";
                promises.push(zpravy_service.processLink(fullLink, channelVeda, toReCheck, arrayQueryToCheck.rows[0].url));
            }
        }


        zpravy_service.update_tables_url_toReCheck("ct_pocasi", toReCheck);
    });*/
};

function isValidLink(link) {
    return link.includes("/clanek/");
}