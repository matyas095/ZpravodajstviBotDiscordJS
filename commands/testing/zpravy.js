// Imports
const { 
	SlashCommandBuilder, 
	PermissionFlagsBits, 
	EmbedBuilder,
	MessageFlags 
} = require('discord.js');

// Modules
const filterArray = require("../../config/zpravy/filters/filterZpravy.js");

// Services
const postgres_service = global.pathFinderOfService("postgres_service");
const zpravy_service = global.pathFinderOfService("zpravy_service");

// Variables
//

// Functions
function __init__() {

	postgres_service.runQuery({
		text: `
			INSERT INTO zpravy (redakce, url)
			VALUES ($1, $2)
			ON CONFLICT (redakce) DO NOTHING
		`,
		values: [
			"__init__()",
			filterArray
		],
	});

}

// Exports
module.exports = {
	data: new SlashCommandBuilder()
		.setName("zpravy")
		.setDescription("Vypíše zprávy dle deníku")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand
				.setName("idnes")
				.setDescription("Vypíše zprávy z webu idnes.cz")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("idnessport")
				.setDescription("Vypíše zprávy z webu sport idnes.cz")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("natgeo")
				.setDescription("Vypíše zprávy z webu National Geographic --- BROKEN NEPOUŽÍVAT NEFUNGUJE!!!!!!")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("nature")
				.setDescription("Vypíše zprávy z webu Nature")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("aktualne")
				.setDescription("Vypíše zprávy z webu Aktuálně")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("aktualnesport")
				.setDescription("Vypíše zprávy z webu Aktuálně-Sport")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("denik")
				.setDescription("Vypíše zprávy z webu Deník")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("ct24")
				.setDescription("Vypíše zprávy z webu ČT24")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("ctpocasi")
				.setDescription("Vypíše počasí z ČT24")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("ctveda")
				.setDescription("Vypíše vědátorství z ČT24")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("irozhlas")
				.setDescription("Vypíše zprávy z webu iRozhlas")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("foxnews")
				.setDescription("Vypíše zprávy z webu Fox News")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("bbcnews")
				.setDescription("Vypíše zprávy z webu BBC")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("nytimes")
				.setDescription("Vypíše zprávy z webu New York Times --- FORCED PAYWALL NEPOUŽÍVAT NEFUNGUJE!!!!!!")
		),
	__init__: __init__,
	async execute(interaction) {
		let toReCheck = [];

		if (interaction.options.getSubcommand() == undefined) return;

		return await this.handleSubcommand.call(this, interaction, toReCheck);
	},

	async handleSubcommand(interaction, toReCheck) {
		const subcommand = interaction.options.getSubcommand();

		if (zpravy_service[subcommand]) {
			return await zpravy_service[subcommand](interaction, toReCheck);
		}

		switch (subcommand) {
			case "natget":
				//await scrapeNatGeo(interaction);
				break;
			default:
				console.error("Command not found! -- zpravy.js");
		}
	}
};