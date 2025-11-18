// Imports
const { 
	SlashCommandBuilder, 
	PermissionFlagsBits, 
	EmbedBuilder,
	MessageFlags 
} = require('discord.js');

// Services
const postgres_service = global.pathFinderOfService("postgres_service"); //require("../../services/postgres_service.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delchannelsthreads")
		.setDescription("Vymaže Threads v kanálu, kde je command invoknutý")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if(interaction.channel.isThread() == true) return interaction.reply({ content: `Nemůžu smazat vlákna v kanálu vlákna, invokni tenhle command v kanálu, kde se nacházejí vlákna a chceš je smazat`, flags: MessageFlags.Ephemeral });
        const threads = await interaction.channel.threads.cache;
        interaction.reply({ content: `Mažu..................`, flags: MessageFlags.Ephemeral });

        for(const [id, thread] of threads) {
            await thread.delete();
        };

        return interaction.followUp({ content: `Celkem ${threads.map(f => f).length} threads bylo vymazáno z tohoto kanálu`, flags: MessageFlags.Ephemeral });
	},
};