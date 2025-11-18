// Imports
const { 
    PermissionFlagsBits,

    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder
} = require('discord.js');
const path = require("path");
const fs = require("fs");

// Services
//

// Variables
const masterPath = path.dirname(__dirname);

// Functions
async function handleSelector(interaction, client, response, cmdCache) {
    const collectorFilter = i => i.user.id === interaction.user.id;
    const selector = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 10 * 1000 });

    const specificCommandEmbed = new EmbedBuilder()
            .setColor(2631720)
            .setTitle("Výpis příkazu")
            .addFields(
                { name: "Příkaz", value: cmdCache[selector.values[0]].name },
                { name: "Deskripce", value: cmdCache[selector.values[0]].description }
            )
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setFooter({ text: `${client.user.username} OS 0.1`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
    for(const option of cmdCache[selector.values[0]].options) {
        specificCommandEmbed.addFields( 
        {
            name: "Název",
            value: option.name,
            inline: true
        }, {
            name: "Deskripce",
            value: option.description,
            inline: true
        });
    };
    await selector.update({ embeds: [specificCommandEmbed] });

    return await handleSelector(interaction, client, response, cmdCache);
};

// Exports
/**
 * Module that handles Slash Command for Moderation
 * @module help/execute
 */

/** HANDLER */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Vypíše všechny příkazy"),
    async execute(interaction, client) {
        //await interaction.deferReply();

        const directories = fs.readdirSync(masterPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

        let cmdStr = "";

        const cmdCache = {};

        const select = new StringSelectMenuBuilder()
			.setCustomId("specific_command")
			.setPlaceholder("Vybrat specifický příkaz");

        for(const directory of directories) {
            const commands = fs.readdirSync(path.join(masterPath, directory))
                            .filter(file => file.endsWith('.js'));

            for(const command of commands) {
                const data = require(path.join(masterPath, directory, command)).data;
                if(data?.default_member_permissions == 8) continue;

                cmdStr += `**/${data.name}** - ${data.description}\n`;

                cmdCache[data.name] = data;

                select.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(data.name)
                        .setDescription(data.description)
                        .setValue(data.name)
                );
            };
        };

        const row = new ActionRowBuilder()
			.addComponents(select);

        const profileEmbed = new EmbedBuilder()
					.setColor(2631720)
                    .setTitle("Výpis příkazů, které podporuju")
                    .setDescription(cmdStr)
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setFooter({ text: `${client.user.username} OS 0.1`, iconURL: client.user.displayAvatarURL() })
					.setTimestamp();

        const response = await interaction.reply({ embeds: [profileEmbed], components: [row], withResponse: true });

        try {        
            await handleSelector(interaction, client, response, cmdCache);
        } catch(e) {
            interaction.editReply({ embeds: [profileEmbed], components: [], withResponse: false });
        };
    },
};