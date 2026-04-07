const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Set up google sheet url for this server.')
		.setDescriptionLocalizations({
			zh_TW: '在此伺服器中榜定Google 表單 URL。',
		})
		.addStringOption(
			option => option.setName('sheet_url')
				.setDescription('Google Sheets URL.')
				.setDescriptionLocalizations(
					{
						'zh-TW': 'Google 表單 URL。',
					}).setRequired(false)),
	cooldown: 5,
	dev: true,
	async execute(interaction) {
		const sheetUrl = interaction.options.getString('sheet_url');
		const guideId = interaction.guildId;
		const userId = interaction.user.id;

		if (!sheetUrl) {
			await interaction.reply({ content: 'Please provide a Google Sheets URL to set up the server.', flags: MessageFlags.Ephemeral })
				.replylocalization('zh-TW', { content: '請提供 Google 表單 URL 來設定表單。', flags: MessageFlags.Ephemeral });
			return;
		}
	},
};