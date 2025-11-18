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

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    const url = "https://www.nytimes.com";

    let channel;
    if(interaction === global.discordClient) {
        interaction = toReCheck;
        toReCheck = [];

        channel = interaction.channels.cache.get(channels_Zpravy["svet"]);
    } else {
        interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });

        channel = await interaction.member.guild.channels.cache.get(channels_Zpravy["svet"]);
    }
    if(!channel) return;


    let arrayQueryToCheck = await postgres_service.runQuery("SELECT * FROM zpravy WHERE redakce='bbcnews'");
    arrayQueryToCheck.rows[0] ??= { url: "null" };

    scraperjs.StaticScraper.create(url).scrape(function ($) {
        return $("a").map(function () {
            return $(this).attr("href")
        }).get();
    }).then(async (r) => {
        return;
        const uniq = [...new Set(r)];
        let promises = [];

        for (const link of uniq) {
            if (isValidLink(link)) {
                const fullLink = link.includes("https://") ? link : url + link;
                promises.push(zpravy_service.processLink(fullLink, channel, toReCheck, arrayQueryToCheck.rows[0].url));
            }
        }

        const promised = (await Promise.all(promises)).filter(e => e).splice(0, MAX_TITLES);
        toReCheck = [];
        promised.forEach(e => {
            if(!toReCheck.includes(e.stringToCheck)) toReCheck.push(e.stringToCheck);
            e.send()
        });

        if(toReCheck.every((el) => {
            return promised.map(e => e.stringToCheck).includes(el)
        }) === false) throw new Error("Failed to get all toReCheck");

        if (toReCheck.length == 0 || promised.length == 0) return;

        zpravy_service.update_tables_url_toReCheck("bbcnews", toReCheck);
    });
}

function isValidLink(link) {
    return link.includes("/news/");
}