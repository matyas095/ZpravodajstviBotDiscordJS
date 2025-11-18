const postgres_service = global.pathFinderOfService("postgres_service");
const zpravy_service = global.pathFinderOfService("zpravy_service");
const config = require("../../../../config/config.js");
const channels_Zpravy = require("../../../../config/zpravy/channelsZpravy.js");

module.exports = async (stringToCheck, channels, toReCheck, arrayQueryToCheck, isExempt) => {
    const urlHostname = new URL(stringToCheck).hostname;

    let keyUrl = urlHostname.substring(
        urlHostname.indexOf(".") + 1,
        urlHostname.lastIndexOf(".")
    );

    const toReCheckArrayQuery = await postgres_service.runQuery(
        "SELECT * FROM zpravy WHERE redakce='__init__()'"
    );

    switch (isExempt) {
        case "ct24veda"       : keyUrl = "ceskatelevizeveda"; break;
        case "nature"         : keyUrl = "nature"           ; break;
        case "aktualnesport"  : keyUrl = "sportaktualne"    ; break;
        case "ct_pocasi"      : keyUrl = "ct24ceskatelevize"; break;
        case "idnessport"     : keyUrl = "idnessport"       ; break;
    }

    if (shouldSkipProcessing(
            stringToCheck,
            toReCheckArrayQuery,
            arrayQueryToCheck,
            toReCheck
    )) { 
        return; // jednoduše return
    }

    // dev režim – pošle do test kanálu
    if (global.configEnves.DEV_IS_DEV_MODE_ON === "TRUE") {
        channels = [channels[0].guild.channels.cache.get(channels_Zpravy["test"])];
    }

    toReCheck.push(stringToCheck);

    const threadChannel = zpravy_service.threads[keyUrl];
    return {
        stringToCheck,
        send: () => {
            // pokud existuje vlákno, pošle tam zprávu
            if (threadChannel) {
                threadChannel.send(stringToCheck);
            }
            for (const channel of channels) {
                channel.send(stringToCheck);
            }
        },
    };
};

function shouldSkipProcessing(
    stringToCheck,
    toReCheckArrayQuery,
    arrayQueryToCheck,
    toReCheck
) {
    return (
        toReCheckArrayQuery.rows[0].url.includes(stringToCheck) ||
        arrayQueryToCheck.includes(stringToCheck) ||
        toReCheck.includes(stringToCheck)
    );
}
