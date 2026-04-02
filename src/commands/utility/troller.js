const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { playerSearch } = require('../../utils/playerSearch.js');
const { fflogsSearch } = require('../../utils/fflogsSearch.js');
const path = require('node:path');
const fs = require('node:fs');

const templatePath = path.join(__dirname, '../../../assets/playerCardTemplate.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));


module.exports = {
	data: new SlashCommandBuilder().setName('troller')
		.setDescription('Catch a troller into pokemon bank.')
		.addIntegerOption(
			option => option.setName('lodestone_id')
				.setDescription('The troller\'s lodestone URL ID.')
				.setDescriptionLocalizations(
					{
						'zh-TW': '輸入戳仔的Lodestone號碼。',
					}).setRequired(true))
		.addStringOption(
			option => option.setName('comment')
				.setDescription('A comment about this player. (Optional)')
				.setDescriptionLocalizations(
					{
						'zh-TW': '備註訊息（選填）',
					}).setRequired(false))
		.addAttachmentOption(
			option => option.setName('screenshot1')
				.setDescription('Upload screenshots (3 at most)')
				.setDescriptionLocalizations(
					{
						'zh-TW': '上傳截圖（最多3張）',
					}).setRequired(false))
		.addAttachmentOption(
			option => option.setName('screenshot2')
				.setDescription('Upload screenshots (3 at most)')
				.setDescriptionLocalizations(
					{
						'zh-TW': '上傳截圖（最多3張）',
					}).setRequired(false))
		.addAttachmentOption(
			option => option.setName('screenshot3')
				.setDescription('Upload screenshots (3 at most)')
				.setDescriptionLocalizations(
					{
						'zh-TW': '上傳截圖（最多3張）',
					}).setRequired(false)),
	cooldown: 5,
	dev: false,
	async execute(interaction) {
		const lodestoneUrl = 'https://na.finalfantasyxiv.com/lodestone/character/';
		const locale = interaction.locale || interaction.user?.locale || 'en-US';
		const lodestoneId = interaction.options.getInteger('lodestone_id');
		const comment = interaction.options.getString('comment') || '';
		const screenshot1 = interaction.options.getAttachment('screenshot1');
		const screenshot2 = interaction.options.getAttachment('screenshot2');
		const screenshot3 = interaction.options.getAttachment('screenshot3');
		const playerInfo = await playerSearch(lodestoneId);

		const reporter = { name: interaction.user.username, avatar: interaction.user.displayAvatarURL() };

		if (!playerInfo) {
			await interaction.reply(locale === 'zh-TW' ?
				{
					content: '無法找到該玩家的資料，請確認Lodestone ID是否正確。',
					flags: MessageFlags.Ephemeral,
				} : {
					content: 'Unable to find player information. Please check if the Lodestone ID is correct.',
					flags: MessageFlags.Ephemeral,
				});
			return;
		}

		const fflogsLink = await fflogsSearch(playerInfo.name, playerInfo.world, playerInfo.dc);

		const embedData = JSON.parse(JSON.stringify(template.embed));
		embedData.title = playerInfo.name;
		embedData.url = lodestoneUrl + lodestoneId;
		embedData.timestamp = new Date().toISOString();
		embedData.footer.text = reporter.name;
		embedData.footer.icon_url = reporter.avatar;
		embedData.thumbnail.url = playerInfo.avatar;
		embedData.description = comment;
		embedData.fields[0].value = lodestoneId;
		embedData.fields[1].value = `[${playerInfo?.name}](${fflogsLink})`;


		const images = [screenshot1?.url, screenshot2?.url, screenshot3?.url].filter(Boolean);
		if (locale === 'zh-TW') {
			await interaction.reply(
				{
					content: `
                    **收服到寶可夢了！**
                    `,
					embeds: [embedData],
					files: images,
				},
			);
		}
		else {
			await interaction.reply(
				{
					content: `
                    **Caught a Pokémon!**
                    `,
					embeds: [embedData],
					files: images,
				},

			);
		}
	},
};