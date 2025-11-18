//Imports
const { MessageFlags } = require("discord.js");
const scraperjs = require("scraperjs");
//

// Services
const zpravy_service = require("../../zpravy_service.js");

// Variables
const MAX_TITLES = global.configEnves.ZPRAVY_CONFIG_MAX_ARTICLES;
const url = "https://ct24.ceskatelevize.cz";

// Functions

// Exports
module.exports = async (interaction, toReCheck) => {
    await zpravy_service.handleMainFunction(interaction, toReCheck, url,
             "cr", "ct24", "a[href*=\"clanek\"]", isValidLink, MAX_TITLES);
    /*const url = "https://ct24.ceskatelevize.cz/";

    let channel;
    let channelVeda;
    if (interaction === global.discordClient) {
        interaction = toReCheck;
        toReCheck = [];

        channel = interaction.channels.cache.get(channels_Zpravy["cr"]);
        channelVeda = interaction.channels.cache.get(channels_Zpravy["veda"]);
    } else {
        interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });

        channel = interaction.member.guild.channels.cache.get(channels_Zpravy["cr"]);
        channelVeda = interaction.member.guild.channels.cache.get(channels_Zpravy["veda"]);
    }

    if (!channel || !channelVeda) return;

    let arrayQueryToCheck = await postgres_service.runQuery("SELECT * FROM zpravy WHERE redakce='ct24'");
    arrayQueryToCheck.rows[0] ??= { url: "null" };

    const links = await scrapeLinks(url);
    const uniq = [...new Set(links)];
    const uniq = [...new Set(links)];

    await processLinks(links, channel, channelVeda, toReCheck, arrayQueryToCheck.rows[0].url, promises);

    const promised = (await Promise.all(promises)).filter(e => e).splice(0, MAX_TITLES);
    toReCheck = [];
    promised.forEach(e => {
        if(!toReCheck.includes(e.stringToCheck)) toReCheck.push(e.stringToCheck);
        e.send()
    });

    if(toReCheck.every((el) => {
        return promised.map(e => e.stringToCheck).includes(el)
    }) === false) throw new Error("Failed to get all toReCheck.");

    if (toReCheck.length == 0 || promised.length == 0) return;
    const promised = (await Promise.all(promises)).filter(e => e).splice(0, MAX_TITLES);
    toReCheck = [];
    promised.forEach(e => {
        if(!toReCheck.includes(e.stringToCheck)) toReCheck.push(e.stringToCheck);
        e.send()
    });

    if(toReCheck.every((el) => {
        return promised.map(e => e.stringToCheck).includes(el)
    }) === false) throw new Error("Failed to get all toReCheck.");

    if (toReCheck.length == 0 || promised.length == 0) return;

    zpravy_service.update_tables_url_toReCheck("ct24", toReCheck);*/
};

async function processLinks(links, channel, channelVeda, toReCheck, lastUrl, promises) {
    for (const link of links) {
        if (shouldProcessLink(link)) {
            const fullLink = constructFullLink(link);
            promises.push(zpravy_service.processLink(fullLink, channel, toReCheck, lastUrl));
            promises.push(zpravy_service.processLink(fullLink, channel, toReCheck, lastUrl));
        }
        if (isVedaLink(link)) {
            const fullLink = constructFullLink(link) + "///VEDA";
            promises.push(zpravy_service.processLink(fullLink, channelVeda, toReCheck, lastUrl));
        }
    }
}

function constructFullLink(link) {
    return link.includes("https://") ? link : "https://ct24.ceskatelevize.cz" + link;
}

const scrapeLinks = async (url) => {
    return scraperjs.StaticScraper.create(url).scrape(function ($) {
            return $("[href*=\"clanek\"]").map(function () {
            return $("[href*=\"clanek\"]").map(function () {
                return $(this).attr("href")
            }).get();
        });
    })
}

function isVedaLink(link) {
    return link.includes("/veda/") && link.includes("/clanek/") && !link.endsWith("/");
}

function shouldProcessLink(link) {
    return isValidLink(link) && !link.endsWith("/") && !link.includes("/veda/");
}

function isValidLink(link) {
    return link.includes("/tema/") || link.includes("/textovy-prenos/") || link.includes("/textovy-prenos/")
        || link.includes("/clanek/") || link.includes("/zpravy-domov/") || link.includes("/svet/")
}