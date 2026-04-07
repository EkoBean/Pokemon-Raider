const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hashApiKey } = require('../utils/hashApiKey');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Set up google sheet url for this server.')
		.setDescriptionLocalizations({
			zh_TW: '在此伺服器中榜定Google 表單 URL。',
		})
		.addStringOption(
			option => option.setName('api_key')
				.setDescription('Google Sheets API key.')
				.setDescriptionLocalizations(
					{
						'zh-TW': 'Google Sheets API 金鑰。',
					}).setRequired(false)),
	cooldown: 5,
	dev: true,
	async execute(interaction) {
		const apiKey = interaction.options.getString('api_key');
		const guideId = interaction.guildId;
		const userId = interaction.user.id;

		if (!apiKey) {
			await interaction.reply({ content: 'Please provide a Google Sheets API key to set up the server.', flags: MessageFlags.Ephemeral })
				.replylocalization('zh-TW', { content: '請提供 Google Sheets API 金鑰來設定表單。', flags: MessageFlags.Ephemeral });
			return;
		}

		// const hashedKey = await hashApiKey(apiKey);

		
	}
};