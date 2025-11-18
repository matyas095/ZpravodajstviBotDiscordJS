const { MessageFlags } = require("discord.js");
const channels_Zpravy = require(global.pathModule.join(global.rootDir, "config/zpravy/channelsZpravy.js"));

module.exports = async (interaction, toReCheck, channelTypes) => {
    const types = getValidChannelTypes(channelTypes);
    const scope = getScope.call(this, interaction, toReCheck);

    if (!scope) {
        //handleNoScope(interaction);
        return [];
    }

    return getFilteredChannels(scope, types);
};

const getValidChannelTypes = (channelTypes) => {
    return (Array.isArray(channelTypes) ? channelTypes : [channelTypes]).filter(Boolean);
};
    
const getScope = function (interaction, toReCheck) {
    return interaction === global.discordClient
        ? toReCheck?.channels?.cache
        : interaction?.member?.guild?.channels?.cache;
};

const handleNoScope = (interaction) => {
    if (interaction !== global.discordClient) {
        interaction.reply({ content: "Secret Pong!", flags: MessageFlags.Ephemeral });
    }
};

const getFilteredChannels = (scope, types) => {
    return types.map(type => scope.get(channels_Zpravy[type])).filter(Boolean);
};
