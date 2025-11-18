// Imports
const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder,
    MessageFlags 
} = require('discord.js');

// Services
const postgres_service = global.pathFinderOfService("postgres_service"); //require("../../services/postgres_service.js");
const user_service = global.pathFinderOfService("user_service");
const { WarningsRepository, ModerationRepository, UsersRepository } = require(global.returnPathToService("postgres_service")).repositories;

/* ModerationRepository.builder()
                       .targetId(716211977210560532n)
                       .reason("ye")
                       .issuedBy(716211977210560532n)
                       .type(2)
                       .logsMessage_id(24241)
                       .build();
ModerationRepository.find()
                    .targetId(716211977210560532n)
                    .type(2)
                    .execute().then(q => { console.log(q.isActive.get()); });

(async() => {
    const select = await ModerationRepository.select()
                                             .targetId(716211977210560532n)
                                             .type(2)
                                             .execute();


    console.log(select[0].id.get());
})() */


/* (async() => {
    const thing = await ModerationRepository.find()
                                            .targetId(716211977210560532n)
                                            .type(1)
                                            .execute();
    //thing.reason.set("yes").save();
    //console.log(thing);
})(); */
// Modules
const registerUser = require("../../services/modules/users/registerUser.js");

// Variables
const xp_Table = {
    0: "Goofy",
    50: "Ahh",
    150: "Hello there"
}

// Functions

/**
 * Converts a stringified date to Date object. 
 * @function
 * @param {String} timeString - String in date format.
 * @returns {Date}            - Returning Date object in CET.
 */
function convertToTime(timeString) {
	return new Date(timeString).toLocaleDateString({ "hc": "hc24" }, {
																weekday: "long",
																year: "numeric",
																month: "long",
																day: "numeric",
																timeZoneName: "shortGeneric"
															  })
}

// Exports
/**
 * Module that handles Slash Command for Moderation
 * @module moderation-data/execute
 */

/** HANDLER */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Vypíše server-based profil")
        .addUserOption(option => 
            option.setName("user")
                  .setDescription("Zobrazí profil uživatele")
        ),
    async execute(interaction, client) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id)

        let userTable = await UsersRepository.find()
                                               .userId(user.id)
                                               .execute();
        if(userTable.length == 0) { 
            registerUser(user.id); 
            userTable = await UsersRepository.find()
                                             .userId(user.id)
                                             .execute(); 
        };

        let xp_Rank = {};
        for(const i in Object.keys(xp_Table)) {
            if(userTable.chatXp.get() >= Object.keys(xp_Table)[Object.keys(xp_Table).length - 1]) 
                xp_Rank.xp = Object.values(xp_Table)[Object.keys(xp_Table).length - 1]; xp_Rank.name = "N/A";
            if(userTable.chatXp.get() >= Object.keys(xp_Table)[i] 
                && userTable.chatXp.get() <= Object.keys(xp_Table)[parseInt(i) + 1]) 
                        xp_Rank.xp = Object.values(xp_Table)[i]; 
        };


        const profileEmbed = new EmbedBuilder()
					.setColor(2631720)
					.addFields(
						{ name: "Uživatel", value: `${user}`, inline: true },
						{ name: "Připojil se dne", value: `${convertToTime(member.joinedAt)}` },
						{ name: "Účet vytvořen dne", value: `${convertToTime(user.createdAt.toString())}` },
						{ name: "Chat skóre", value: `**${xp_Rank.xp}**(${userTable.chatXp.get()})` },
						{ name: `Role[${member.roles.cache.size - 1}]`, value: `${member.roles.cache
                                        .filter(r => r.id !== interaction.guild.id)
                                        .map(r => r).join(", ") || 'Žádné'}` }
					)
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
                    .setFooter({ text: `${client.user.username} OS 0.1`, iconURL: client.user.displayAvatarURL() })
					.setTimestamp();

        interaction.editReply({ embeds: [profileEmbed] });
    },
};