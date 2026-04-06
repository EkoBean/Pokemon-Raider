const { SlashCommandBuilder, MessageFlags } = require('discord.js');

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
};