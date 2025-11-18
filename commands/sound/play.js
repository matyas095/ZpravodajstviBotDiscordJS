// Imports
const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder,
    MessageFlags 
} = require('discord.js');
const ytdl = require("ytdl-core");

// Services
const postgres_service = global.pathFinderOfService("postgres_service"); //require("../../services/postgres_service.js");
const user_service = global.pathFinderOfService("user_service");
const { WarningsRepository, ModerationRepository, UsersRepository } = require(global.returnPathToService("postgres_service")).repositories;
// Modules
//

// Functions

// Exports
/**
 * Module that handles Slash Command for Moderation
 * @module moderation-data/execute
 */

/** HANDLER */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Zahraje hudbu z YT")
        .addStringOption(option => 
            option.setName("url")
                  .setDescription("Link na video")
                  .setRequired(true)
        ),
    async execute(interaction, client) {
        if(ytdl.validateURL(interaction.options.getString("url")) == false) 
            return interaction.reply("Neplatný YT/Video link.");
        const SongPlayer = client.utils.audioQueue[interaction.guild.id];
        const channelObj = /* getVoiceConnection(interaction.guild.id) || */ await interaction.member.voice.fetch().catch(e => null);
        if(interaction.member.voice?.channel != null) {
            const connection = SongPlayer.joinChannel(channelObj);
            SongPlayer.subscribe(SongPlayer.createSongPlayer());
        };
        SongPlayer.pushQueue(interaction.options.getString("url"));
    },
};