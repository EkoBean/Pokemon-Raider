const { SlashCommandBuilder, MessageFlags, Locale } = require('discord.js');
const { generateAuthUrl } = require('../../utils/googleAuth.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Set up google sheet url for this server.')
		.setDescriptionLocalizations({
			'zh-TW': '在此伺服器中榜定Google 表單 URL。',
		})
		.addStringOption(
			option => option.setName('sheet_url')
				.setDescription('Please provide the Google Sheets URL.')
				.setDescriptionLocalizations(
					{
						'zh-TW': '請貼上Google表單的網址。',
					}).setRequired(true)),
	cooldown: 5,
	dev: false,
	async execute(interaction) {
		const locale = interaction.locale || interaction.user?.locale || 'en-US';
		const sheetUrl = interaction.options.getString('sheet_url');
		const spreadsheetId = sheetUrl ? sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] : null;
		const guildId = interaction.guildId;
		const userId = interaction.user.id;
		const authContext = guildId ?
			{
				userId: null,
				guildId,
				spreadsheetId,
			} : {
				userId,
				guildId: null,
				spreadsheetId,
			};

		if (!sheetUrl) {
			await interaction.reply(locale == 'zh-TW' ? { content: '請提供 Google 表單 URL 來設定表單。', flags: MessageFlags.Ephemeral } : { content: 'Please provide a Google Sheets URL to set up the server.', flags: MessageFlags.Ephemeral });
			return;
		}

		const authUrl = generateAuthUrl(authContext);

		await interaction.reply(locale == 'zh-TW' ? {
			content: `請點擊以下連結授權機器人存取您的 Google 表單： [授權連結](${authUrl})`,
			flags: MessageFlags.Ephemeral,
		} : {
			content: `Please authorize the bot by visiting this URL: [Authorize Link](${authUrl})`,
			flags: MessageFlags.Ephemeral,
		});

	},
};