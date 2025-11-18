// Imports
const { MessageFlags } = require("discord.js");
const axios = require("axios");

// Services
const scraper_service = global.pathFinderOfService("scraper_service");
const zpravy_service = require(global.returnPathToService("zpravy_service"));
const { ZpravyRepository } = require(global.returnPathToService("postgres_service")).repositories;
const reddit_service = global.pathFinderOfService("reddit_service");

// Variables
const subreddits = [
    "czech",
    "okkamaraderetarde",
    "memes",
    "ProgrammerHumor", 
    "PrequelMemes", 
    "dankmemes", 
    "Boomerhumour", 
    "gamingmemes", 
    "wholesomememes", 
    "wholesomememes", 
    "HistoryMemes"
];

// Functions
async function runRedditer(url, channel) {
    const data = await reddit_service.runRequest(url);
    if(data == undefined) return;

    const redditAlreadySent = await selectRedakci();
    const appending = [];

    for(const obj of data) {
        if(obj?.data?.url.includes("//i.redd.it/")) {
            if(redditAlreadySent.url.get().includes(obj.data.url) || appending.includes(obj.data.url)) continue;
            appending.push(obj.data.url);

            channel.send(obj.data.url);
        };
    };
    if(appending.length == 0) return;
    
    zpravy_service.update_tables_url_toReCheck("reddit_memes", [...new Set(appending)]);
    return;
};

async function selectRedakci() {
    let redditAlreadySent = (await ZpravyRepository.select().redakce("reddit_memes").execute())[0] || [];
    if(redditAlreadySent?.length == 0) { 
        await ZpravyRepository.insert(["redakce", "url"], ["reddit_memes", []]);

        redditAlreadySent = (await ZpravyRepository.select().redakce("reddit_memes").execute())[0];
    };
    return redditAlreadySent;
};

// Exports
module.exports = async (interaction, toReCheck) => {
    const channel = toReCheck.channels.cache.get(global.configEnves.REDDIT_CHANNEL_ID) || await toReCheck.channels.fetch(global.configEnves.REDDIT_CHANNEL_ID);
    for(const subreddit of subreddits) {
        await runRedditer(`https://oauth.reddit.com/r/${subreddit}.json`, channel);
    };
};