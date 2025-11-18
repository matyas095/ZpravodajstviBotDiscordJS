// Imports
const fs = require('fs');
const path = require('path');
const { Client, Collection } = require('discord.js');

// Modules
//

// Variables
let __run__executed = false;
const updateChannel_timeout = 60 * 1000

// Functions
async function updateChannel(...args) {
    const argumentsArray = Array.prototype.slice.call(arguments, 0);
    const [guild, channel] = [argumentsArray[0], argumentsArray[1]]

    if(!guild || guild == undefined) setTimeout(() => { updateChannel(...args) }, updateChannel_timeout);

    const guildMemberCount = guild.memberCount;
    const channelNumberCount = Number(channel.name.replace(/^\D+/g, ''));
    if(guildMemberCount === channelNumberCount) setTimeout(() => { updateChannel(...args) }, updateChannel_timeout);
    
    await channel.setName(`Uživatelé: ${guildMemberCount}`, `Změna lidstva hýr`);

    setTimeout(() => { updateChannel(...args) }, updateChannel_timeout);
}
//

// Export
module.exports = {
    __init__: (client) => {
        const eventsPath = path.join(global.rootDir, 'services/modules/events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            };
        };

        client.guilds.fetch("803724596195885077").then((guild) => { guild.channels.fetch("806074290864652298").then((channel) => { module.exports.__run__(guild, channel); }) });
    },
    __run__: (...args) => {
        if(__run__executed === true) return;
        __run__executed = true;

        updateChannel(...args);
    }
}