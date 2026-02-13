// Imports
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// Services
const postgres_service = global.pathFinderOfService("postgres_service");

// Modules
const channels_Zpravy = require("../config/zpravy/channelsZpravy.js");
const threads_Zpravy = require("../config/zpravy/threadsZpravy.js");

// Variables
const module_paths = path.join(global.rootDir, "services/modules/zpravy");
const functions_paths = path.join(global.rootDir, "services/modules/zpravy/functions");

// Functions
async function retrieveChannels(guild) {
    //if(global.configEnves.DEV_IS_DEV_MODE_ON === "TRUE") return await guild.channels.fetch(channels_Zpravy["test"]);

    return await Promise.all(Object.keys(channels_Zpravy).map(async (e) => {
        return await guild.channels.fetch(channels_Zpravy[e]);
    }));
};

async function setupThreads(channels, guildRoles) {
    channels = Array.isArray(channels) ? channels : [channels].filter(Boolean);

    const roleIds = (global.configEnves.THREADS_ROLES_TO_JOIN || "").split(",").filter(Boolean);
    const membersToBeAddedByRole = guildRoles
        .filter(r => roleIds.includes(r.id))
        .map(r => r.members);

    for (const key of Object.keys(threads_Zpravy)) {
        const obj = threads_Zpravy[key];
        const channel = (global.configEnves.DEV_IS_DEV_MODE_ON === "TRUE")
            ? channels.find(c => c?.name === "test")
            : channels.find(c => c?.name?.includes(key));
        if (!channel) continue;

        let threads = await channel.threads.fetch();
        let archivedThreads = await channel.threads.fetchArchived();

        if (global.configEnves.DESTROY_ZPRAVY_THREADS_ON_INIT === "TRUE") {
            for (const [, thread] of threads.threads) {
                await thread.delete("Cleansing").catch(() => { });
            };
            threads = await channel.threads.fetch();
            archivedThreads = await channel.threads.fetchArchived();
        };
        await processThreads(obj, channel, threads, archivedThreads, membersToBeAddedByRole);
    };
};

async function processThreads(obj, channel, threads, archivedThreads, membersToBeAddedByRole) {
    const created = [];

    for (const threadKey of Object.keys(obj)) {
        const wantedName = obj[threadKey].option.name;
        const existing = [...threads.threads.values()].find(t => t.name === wantedName) || [...archivedThreads.threads.values()].find(t => t.name === wantedName);
        if (existing) { module.exports.threads[threadKey] = existing; continue; }

        const thread = await channel.threads.create(obj[threadKey].option);
        module.exports.threads[threadKey] = thread;
        created.push(thread);
        await setupThread(thread, obj, threadKey, membersToBeAddedByRole, channel);
    };

    if (created.length > 0) {
        const embed = new EmbedBuilder()
            .setColor(0x1E1E27)
            .setTitle(`Vlákna pro kanál ${channel}`)
            .setDescription(`Následující vlákna jsou součástí tohoto kanálu:`)
            .addFields({ name: "Vlákna", value: created.map(t => `<#${t.id}>`).join("\n") })
            .setTimestamp();

        await channel.send("``` ```\n\n");
        const message = await channel.send({ embeds: [embed] });
        await channel.send("\n\n``` ```");
        await message.pin().catch(() => { });
    };
};

async function setupThread(thread, obj, threadKey, membersToBeAddedByRole) {
    try { if (thread.joinable) await thread.join(); } catch { };
    try { await thread.setLocked(true); } catch { };

    membersToBeAddedByRole.forEach((f) => {
        for(const [key, member] of f) {
            if(global.configEnves.DEV_IS_DEV_MODE_ON === "TRUE") return;

            thread.members.add(key);
        }
        return;
    });

    const desc = obj[threadKey].description;
    const infoEmbed = new EmbedBuilder()
        .setColor(desc.main_color)
        .setTitle(`Vlákno pro zpravodajský web __**${obj[threadKey].option.name}**__`)
        .setURL(`${desc.sources[0]}`)
        .setDescription(`Toto vlákno slouží jako uložiště vyfiltrovaných zpráv pro web ${obj[threadKey].option.name}\n`)
        .addFields({ name: "Zdroje pro toto vlákno", value: desc.sources.join("\n") })
        .setTimestamp();

    setTimeout(async () => {
        await thread.send({ embeds: [infoEmbed] });
        await thread.send("``` ```");
    }, 10_000);
};


// Exports
module.exports.__init__ = async () => {
    module.exports.threads = {}

    const zpravyModulesToRun = {}
    let counter = 0;

    const guild = await global.discordClient.guilds.fetch("803724596195885077");
    const guildRoles = await guild.roles.fetch();
    const guildMembers = await guild.members.fetch();

    const channels = await retrieveChannels(guild);
    module.exports.channels = channels;
    await setupThreads(channels, guildRoles);

    const files = fs.readdirSync(module_paths)
        .filter(file => file.endsWith('.js'))
    const filesFunctions = fs.readdirSync(functions_paths)
        .filter(file => file.endsWith('.js'))

    for (const file of files) {
        const requiredFile = require(module_paths + "/" + file);

        module.exports[file.split(".js")[0]] = requiredFile
        zpravyModulesToRun[file.split(".js")[0]] = requiredFile
    }
    for (const file of filesFunctions) {
        const requiredFile = require(functions_paths + "/" + file);

        module.exports[file.split(".js")[0]] = requiredFile;
    }

    if(global.configEnves.DEV_IS_DEV_MODE_ON == "TRUE") {
        zpravyModulesToRun[Object.keys(zpravyModulesToRun)[13]](global.discordClient, guild);
        return console.log("DEV MODE ON - zpravy.js");
    };

    async function runZpravy(zpravyObj) {
        if (counter == 0) console.log("-------------");
        console.log("    " + Object.keys(zpravyModulesToRun)[counter] + ".js has been executed");

        if(global.configEnves.ZPRAVY_COMMAND_MODULE_TO_IGNORE.split(",").includes(Object.keys(zpravyModulesToRun)[counter])) {
            counter++;
            return runZpravy(zpravyModulesToRun[Object.keys(zpravyModulesToRun)[counter]]);
        };
        counter++;
        await zpravyObj(global.discordClient, guild);

        if (counter == Object.keys(zpravyModulesToRun).length) {
            counter = 0;
            return setTimeout(() => { console.log("-------------"); runZpravy(zpravyModulesToRun[Object.keys(zpravyModulesToRun)[counter]]) }, 60 * 60 * 1000);
        }

        setTimeout(() => { runZpravy(zpravyModulesToRun[Object.keys(zpravyModulesToRun)[counter]]) }, 20 * 1000);
    }

    setTimeout(() => { runZpravy(zpravyModulesToRun[Object.keys(zpravyModulesToRun)[counter]]); }, 60 * 1000);
}

module.exports.standartScraperFunctionMAP = function($) {
    return $(elementsToScrape).map(function() {
        return $(this).attr("href")
    }) 
}