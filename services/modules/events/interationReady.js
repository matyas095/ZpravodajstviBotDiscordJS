// Imports
const { Events, MessageFlags } = require('discord.js');

// Services
const user_service = global.pathFinderOfService("user_service");
const config = require("../../../config/config.js");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
	    //if (!interaction.isUserContextMenuCommand()) return;

        if (this.isDevModeActive(interaction)) return;

        this.registerUserIfNeeded(interaction);

        const command = this.getCommand(interaction);
        if (!command) return;

        await this.executeCommand(command, interaction, client);
    },

    isDevModeActive(interaction) {
        return config.DEV_IS_DEV_MODE_ON === "TRUE" && interaction.user.id !== config.DEV_HEAD_USER_ID;
    },

    registerUserIfNeeded(interaction) {
        if (!global.registeredUsers.includes(interaction.user.id)) {
            user_service.registerUser(interaction.user.id);
        }
    },

    getCommand(interaction) {
        return global.discordClient.commands.get(interaction.commandName);
    },

    async executeCommand(command, interaction, client) {
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await this.handleCommandError(interaction);
        }
    },

    async handleCommandError(interaction) {
        const response = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    }
};