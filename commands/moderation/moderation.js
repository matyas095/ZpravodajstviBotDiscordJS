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
const { WarningsRepository, ModerationRepository } = require(global.returnPathToService("postgres_service")).repositories;

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
					.execute().then(q => { console.log(q) }); */
// Modules
const { MODERATION_LOG_CHANNEL } = require("../../config/config.js");

// Functions
/**
 * Check if provided Number value is an Integer.
 * @function
 * @param {Number} value - A number to be validified.
 * @returns {Boolean}    - Whether the Number is an Integer.
 */
function isInt(value) {
	return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

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
																dayPeriod: "long",
																hour: "numeric",
																minute: "numeric",
																timeZoneName: "shortGeneric"
															  })
}

/**
 * Handles the Warning-Add Option 
 * @function
 * @param {Interaction} interaction - Interaction command
 */
async function issueWarning(interaction) {
	if(!global.registeredUsers.includes(interaction.options.getUser("user").id)) 
		user_service.registerUser(interaction.options.getUser("user").id);

	const logsChannel = await interaction.guild.channels.cache.get(MODERATION_LOG_CHANNEL);
	const warningsTable = await WarningsRepository.selectMany({ "target_id": interaction.options.getUser("user").id });

	const warnIssueEmbed = new EmbedBuilder()
		.setColor(15469066)
		.setTitle(`<:dostanesflkanec:805742640087433226> Varování vypsané #${warningsTable.length + 1}`)
		.addFields(
			{ name: "Uživatel", value: `${interaction.options.getUser("user")}`, inline: true },
			{ name: "Vypsal", value: `${interaction.user}`, inline: true },
			{ name: "Důvod", value: `${interaction.options.getString("reason")}` }
		)
		.setTimestamp();

	await interaction.editReply({ embeds: [warnIssueEmbed] });

	//await interaction.options.getUser("user").send({ embeds: [warnIssueEmbed] });
	await dmUser(interaction.options.getUser("user"), { embeds: [warnIssueEmbed] }, interaction);
	const logsMessage = await logsChannel.send({ embeds: [warnIssueEmbed] });

	
	return await WarningsRepository.insert(
		[
			"target_id",
			"reason",
			"issued_by",
			"logs_message_id"
		],
		[
			interaction.options.getUser("user").id,
			interaction.options.getString("reason"),
			interaction.user.id,
			logsMessage.id
		]);
};

/**
 * Handles the DMing forward the User and handles if, the bot cannot reach the User.
 * @function
 * @param {User} user               - User to DM
 * @param {String} text             - What we're sending
 * @param {Interaction} interaction - Interaction command
 */
function dmUser(user, text, interaction) {
	return user.send(text).catch(() =>
		 interaction.followUp({ content: "Nemůžu poslat DM uživateli", flags: MessageFlags.Ephemeral }));
};

// Exports
/**
 * Module that handles Slash Command for Moderation
 * @module moderation-data/execute
 */

/** HANDLER */
module.exports = {
	data: new SlashCommandBuilder()
		.setName("moderation")
		.setDescription("Moderace uživatelů")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)

		// Varování

		.addSubcommand(subcommand =>
			subcommand
				.setName("warningview")
				.setDescription("Vypíše vypsané varování uživatele")
				.addUserOption(option => 
					option.setName("user")
					.setDescription("Uživatel")
					.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("warningviewbyid")
				.setDescription("Vypíše kompletní varování zadanou dle ID")
				.addIntegerOption(option => 
					option.setName("id")
					.setDescription("Id varování")
					.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("warningadd")
				.setDescription("Vypíše varování uživateli")
				.addUserOption(option => 
					option.setName("user")
					.setDescription("Uživatel")
					.setRequired(true)
				)
				.addStringOption(option => 
					option.setName("reason")
					.setDescription("Důvod varování")
					.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("warningremove")
				.setDescription("Vypíše varování uživateli")
				.addIntegerOption(option => 
					option.setName("id")
					.setDescription("Id varování")
					.setRequired(true)
				)
				.addStringOption(option => 
					option.setName("reason")
					.setDescription("Důvod výmazu")
					.setRequired(true)
				)
		)

		// Kickování

		.addSubcommand(subcommand =>
			subcommand
				.setName("kick")
				.setDescription("Kickne uživatele")
				.addUserOption(option => 
					option.setName("user")
					.setDescription("Uživatel")
					.setRequired(true)
				)
				.addStringOption(option => 
					option.setName("reason")
					.setDescription("Důvod pro kick")
					.setRequired(true)
				)
		)

		// Banování

		.addSubcommand(subcommand =>
			subcommand
				.setName("ban")
				.setDescription("Zabanuje uživatele")
				.addUserOption(option => 
					option.setName("user")
					.setDescription("Uživatel")
					.setRequired(true)
				)
				.addStringOption(option => 
					option.setName("reason")
					.setDescription("Důvod pro kick")
					.setRequired(true)
				)
				.addIntegerOption(option => 
					option.setName("msgtodel")
					.setDescription("Kolik zpráv se má smazat dle času (v sekundách) (MAX 7 DNÍ)")
					.setMinValue(0)
					.setMaxValue(60 * 60 * 24 * 7) // 7 Dní
				)
		)

		// Mutování

		.addSubcommand(subcommand =>
			subcommand
				.setName("mute")
				.setDescription("Mutne uživatele")
				.addUserOption(option => 
					option.setName("user")
					.setDescription("Uživatel")
					.setRequired(true)
				)
				.addStringOption(option => 
					option.setName("reason")
					.setDescription("Důvod mutnutí")
					.setRequired(true)
				)
				.addIntegerOption(option => 
					option.setName("delka")
					.setDescription("Jak dlouho bude uživatel mutnutý (v sekundách), pokud argument chybí, tak je standartně na 5 minut")
				)
		)

		// Bulk Deletování

		.addSubcommand(subcommand =>
			subcommand
				.setName("bulk_delete")
				.setDescription("Vymaže # zpráv z kanálu, kde je invoked command")
				.addIntegerOption(option => 
					option.setName("bulk_int")
					.setDescription("Kolik zpráv se vymaže")
					.setRequired(true)
				)
		),
	async execute(interaction) {
		switch(interaction.options.getSubcommand()) {
			case "warningviewbyid": {
				await interaction.deferReply();
				const warningsTable = await WarningsRepository.selectOne({ "id": interaction.options.getInteger("id") });

				if(warningsTable.length == 0) return await interaction.editReply({ content: `Nemohl jsem najít instance dle Id ${interaction.options.getInteger("id")} máš ho zapsaný správně?`, flags: MessageFlags.Ephemeral });

				const warnIssueEmbed = new EmbedBuilder()
					.setColor(723984)
					.setTitle(`<:babis_thinking:803930677321007124> Výpis Varování dle Id`)
					.addFields(
						{ name: "Uživatel", value: `<@${warningsTable.target_id}>`, inline: true },
						{ name: "Odůvodnění", value: `${warningsTable.reason}` },
						{ name: "Vypsal", value: `<@${warningsTable.issued_by}>` },
						{ name: "Aktivní", value: warningsTable.is_active == true ? "Ano" : "Ne" },
						{ name: "Datum vypsání", value: `${convertToTime(warningsTable.created_at)}`, inline: true }
					)
					.setFooter( { text: "Všechny časové údaje jsou v pásmě CET (Central European Time)" } )
					.setTimestamp();

				if(warningsTable.updated_at != null) 
					warnIssueEmbed.addFields( { name: "Aktualizovaný", value: `${convertToTime(warningsTable.updated_at)}`, inline: true });

				await interaction.editReply({ embeds: [warnIssueEmbed] });

				break;
			};
			case "warningview": {
				await interaction.deferReply();
				const warningsTable = await WarningsRepository.selectMany({ "target_id": interaction.options.getUser("user").id });

				const warnIssueEmbeds = [new EmbedBuilder()
					.setColor(723984)
					.setTitle(`<:babis_thinking:803930677321007124> Výpis Varování`)
					.setDescription("🟢 - AKTIVNÍ; 🔴 - SMAZANÝ/DEAKTIVOVANÝ")
					.addFields(
						{ name: "Uživatel", value: `${interaction.options.getUser("user")}`, inline: true }
					)
					.setTimestamp()
				];

				for(const warningKey of Object.keys(warningsTable)) {
					if((warningKey / 5) % 1 == 0 && warningKey != 0) {
						warnIssueEmbeds.push(
							new EmbedBuilder()
								.setColor(723984)
								.setTitle(`<:babis_thinking:803930677321007124> Tabule Varování - str ${~~(warningKey / 5) + 1}`)
								.setDescription(warningKey)
								.setTimestamp()
						);
					};

					warnIssueEmbeds[~~(warningKey / 5)].addFields(
						{ name: `#${parseInt(warningKey) + 1} s ID: ${warningsTable[warningKey].id} - ${warningsTable[warningKey].is_active == true ? "🟢" : "🔴"}`,
						  value: `${warningsTable[warningKey].reason}` }
					);
				};

				await interaction.editReply({ embeds: warnIssueEmbeds });

				break;
			};
			case "warningadd": {
				await interaction.deferReply();
				
				await issueWarning(interaction);

				break;
			};
			case "warningremove": {
				await interaction.deferReply();
				const logsChannel = await interaction.guild.channels.cache.get(MODERATION_LOG_CHANNEL);
				const warningsTable = await WarningsRepository.selectOne({ "id": interaction.options.getInteger("id") });

				if(warningsTable.length == 0) return await interaction.editReply({ content: `Nemohl jsem najít instance dle Id ${interaction.options.getInteger("id")} máš ho zapsaný správně?`, flags: MessageFlags.Ephemeral });
				
				await WarningsRepository.update(
				{ 
					"is_active": false,
					"updated_at": new Date()
				}, { COLUMN: "id", VALUE: interaction.options.getInteger("id") });

				const warnIssueEmbed = new EmbedBuilder()
					.setColor(2237993)
					.setTitle(`<:borisdie:804335841874411590> Varování zneplatněné`)
					.addFields(
						{ name: "Uživatel", value: `<@${warningsTable.target_id}>`, inline: true },
						{ name: "Zneplatnil", value: `<@${warningsTable.issued_by}>`, inline: true },
						{ name: "Důvod zneplatnění", value: `${interaction.options.getString("reason")}` },
						{ name: "Starý log", value: `https://discord.com/channels/803724596195885077/1408119391974985861/${warningsTable.logs_message_id}` }
					)
					.setTimestamp();
				
				await interaction.editReply({ embeds: [warnIssueEmbed] });
				const logMessage = await logsChannel.send({ embeds: [warnIssueEmbed] });

				const oldMessage = await logsChannel.messages.fetch(warningsTable.logs_message_id);
				const newEmbed = oldMessage.embeds[0].data;
				newEmbed.title += " --- ZNEPLATNĚNO";
				newEmbed.color = 2237993;
				newEmbed.fields.push( { name: "Zneplatňující výrok", value: `https://discord.com/channels/803724596195885077/1408119391974985861/${logMessage.id}`})
				
				await oldMessage.edit({ embeds: [newEmbed] })

				break;
			};
			case "kick": {
				await interaction.deferReply();

				const logsChannel = await interaction.guild.channels.cache.get(MODERATION_LOG_CHANNEL);
				const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id) ? 
					interaction.guild.members.cache.get(interaction.options.getUser("user").id) :
					await interaction.guild.members.fetch(interaction.options.getUser("user").id);

				if(!member.manageable) return interaction.editReply({ content: "Uživatel má vyšší pravomoce jak já, nemohu soráč :/" });

				const kickTable = await ModerationRepository.selectMany({ 
					"target_id": interaction.options.getUser("user").id
				}, {
					"type": 2
				});

				const kickIssueEmbed = new EmbedBuilder()
					.setColor(6037528)
					.setTitle(`<:zeman_punch:804055140834607184> Uživatel vyhozen z kola ven`)
					.addFields(
						{ name: "Uživatel", value: `${interaction.options.getUser("user")}`, inline: true },
						{ name: "Vykonal", value: `${interaction.user}`, inline: true },
						{ name: "Odůvodnění", value: `${interaction.options.getString("reason")}` },
						{ name: "Počet vyhazovů", value: `${kickTable.length + 1}`}
					)
					.setTimestamp();

				const logsMessage = await logsChannel.send( { embeds: [kickIssueEmbed] } );
				interaction.editReply( { embeds: [kickIssueEmbed] } );
				interaction.options.getUser("user").send( { embeds: [kickIssueEmbed] } );

				ModerationRepository.insert([
						"type",
				        "target_id",
						"reason", 
						"issued_by", 
						"logs_message_id"
					], [
						ModerationRepository.evalType("Kick"),
						interaction.options.getUser("user").id,
						interaction.options.getString("reason"),
						interaction.user.id,
						logsMessage.id
				]);

				member.kick(interaction.options.getString("reason"));

				break;
			};
			case "ban": {
				await interaction.deferReply();

				const logsChannel = await interaction.guild.channels.cache.get(MODERATION_LOG_CHANNEL);
				const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id) ? 
					interaction.guild.members.cache.get(interaction.options.getUser("user").id) :
					await interaction.guild.members.fetch(interaction.options.getUser("user").id);

				if(!member.manageable) return interaction.editReply({ content: "Uživatel má vyšší pravomoce jak já, nemohu soráč :/" });

				const banTable = await ModerationRepository.selectMany({ 
					"target_id": interaction.options.getUser("user").id
				}, {
					"type": 3
				});

				const banIssueEmbed = new EmbedBuilder()
					.setColor(5517108)
					.setTitle(`<:zeman_punch:804055140834607184> Uživatel vykostěn (ban) z kola ven`)
					.addFields(
						{ name: "Uživatel", value: `${interaction.options.getUser("user")}`, inline: true },
						{ name: "Vykonal", value: `${interaction.user}`, inline: true },
						{ name: "Odůvodnění", value: `${interaction.options.getString("reason")}` },
						{ name: "Počet banů", value: `${banTable.length + 1}`}
					)
					.setTimestamp();

				const logsMessage = await logsChannel.send( { embeds: [banIssueEmbed] } );
				interaction.editReply( { embeds: [banIssueEmbed] } );
				interaction.options.getUser("user").send( { embeds: [banIssueEmbed] } );

				ModerationRepository.insert([
						"type",
				        "target_id",
						"reason", 
						"issued_by", 
						"logs_message_id"
					], [
						ModerationRepository.evalType("Ban"),
						interaction.options.getUser("user").id,
						interaction.options.getString("reason"),
						interaction.user.id,
						logsMessage.id
				]);

				member.ban({ deleteMessageSeconds: interaction.options.getInteger("msgtodel"), reason: interaction.options.getString("reason") });

				break;
			};
			case "mute": {
				await interaction.deferReply();

				const logsChannel = interaction.guild.channels.cache.get(MODERATION_LOG_CHANNEL);
				const delka = interaction.options.getInteger("delka") == null ?
				 5 * 60 * 1000 : interaction.options.getInteger("delka") * 1000; // když není specifikovaná délka, tak 5 minut, jinak pouźij délku

				const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id) ? 
					interaction.guild.members.cache.get(interaction.options.getUser("user").id) :
					 await interaction.guild.members.fetch(interaction.options.getUser("user").id);

				if(!member.manageable) return interaction.editReply({ content: "Uživatel má vyšší pravomoce jak já, nemohu soráč :/" });

				const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id);
				const muteRole = interaction.guild.roles.cache.find(f => f.name == "Muted" || f.id == "1415229269541388338");

				const moderationLogs = await ModerationRepository.selectOne({ "target_id": interaction.options.getUser("user").id });

				const muteIssueEmbed = new EmbedBuilder()
					.setColor(15469066)
					.setTitle(`<:dostanesflkanec:805742640087433226> Mute Moderace vypsaná #${moderationLogs.length + 1}`)
					.addFields(
						{ name: "Uživatel", value: `${interaction.options.getUser("user")}`, inline: true },
						{ name: "Vypsal", value: `${interaction.user}`, inline: true },
						{ name: "Důvod", value: `${interaction.options.getString("reason")}` },
						{ name: "Délka", value: `${delka / 1000}s (${delka / 1000 / 60}m)` },
						{ name: "Role při mutnutí", value: `${roles.map(r => r).join(", ") || 'Žádné'}`}
					)
					.setTimestamp();

				interaction.editReply({ embeds: [muteIssueEmbed] });
				dmUser(interaction.options.getUser("user"), { embeds: [muteIssueEmbed] }, interaction)
				const logsMessage = await logsChannel.send({ embeds: [muteIssueEmbed] });

				await member.roles.remove(member.roles.cache
												.filter(r => r.id !== interaction.guild.id))
				await member.roles.add(muteRole);

				await member.timeout(delka)
					.catch(console.log);

				setTimeout(() => {
					member.roles.remove(muteRole);
					member.roles.add(roles);

					ModerationRepository.update(
					{ 
						"is_active": false,
						"updated_at": new Date()
					}, { COLUMN: "target_id", VALUE: interaction.options.getUser("user").id });

					const newUnmuteEmbed = new EmbedBuilder()
						.setColor(2237993)
						.setTitle(`<:borisdie:804335841874411590> Mute vypršel`)
						.setDescription(`Mute vypršel a <@${interaction.options.getUser("user").id}> byl unmuted, nyní mohou vesele čedovat dál.`)
						.setTimestamp();

					logsMessage.edit({ embeds: [logsMessage.embeds[0].data, newUnmuteEmbed] })
				}, delka)

				const extra_storage = {
					"delka": delka,
					"roles": roles.map(r => r.id)
				}

				await ModerationRepository.insert(
					[
						"type",
				        "target_id",
						"reason", 
						"issued_by", 
						"logs_message_id", 
						"extra_storage"
					], [
						ModerationRepository.evalType("Mute"),
						interaction.options.getUser("user").id,
						interaction.options.getString("reason"),
						interaction.user.id,
						logsMessage.id,
						JSON.stringify(extra_storage)
					]
				)

				break;
			};
			case "bulk_delete": {
				if(interaction.options.getInteger("bulk_int") > 100) return await interaction.reply({ content: `Maximálné lze smazat 100 zpráv najednou, Váš výběr byl ale ${interaction.options.getInteger("bulk_int")}`, flags: MessageFlags.Ephemeral });
				await interaction.channel.bulkDelete(interaction.options.getInteger("bulk_int"))
					.catch(console.error);

				await interaction.reply({ content: `Úspěšně smazáno celkem ${interaction.options.getInteger("bulk_int")}`, flags: MessageFlags.Ephemeral });

				break;
			};

			default: return console.error("Command not found! -- moderation.js");
		};
	},
};