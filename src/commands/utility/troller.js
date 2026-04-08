const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { playerSearch } = require('../../utils/playerSearch.js');
const { fflogsSearch } = require('../../utils/fflogsSearch.js');
const path = require('node:path');
const fs = require('node:fs');

const templatePath = path.join(__dirname, '../../../assets/playerCardTemplate.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));


module.exports = {
	data: new SlashCommandBuilder().setName('troller')
		.setDescription('Catch a troller into your Pokémon bank.')
		.setDescriptionLocalizations(
			{
				'zh-TW': '把戳仔收進屬於大家的寶可夢銀行。',
			},
		)
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
		const lodestoneId = interaction.options.getInteger('lodestone_id');
		const lodestoneUrl = lodestoneId ? 'https://na.finalfantasyxiv.com/lodestone/character/' + lodestoneId : null;
		const locale = interaction.locale || interaction.user?.locale || 'en-US';
		const comment = interaction.options.getString('comment') || '';
		const screenshot1 = interaction.options.getAttachment('screenshot1');
		const screenshot2 = interaction.options.getAttachment('screenshot2');
		const screenshot3 = interaction.options.getAttachment('screenshot3');
		const playerInfo = await playerSearch(lodestoneId);

		const reporter = { name: interaction.user.username, avatar: interaction.user.displayAvatarURL() };

		if (playerInfo === 404) {
			await interaction.reply(locale === 'zh-TW'
				? { content: '查無此玩家，請確認Lodestone ID是否正確。', flags: MessageFlags.Ephemeral }
				: { content: 'Player not found. Please check the Lodestone ID.', flags: MessageFlags.Ephemeral },
			);
			return;
		}
		if (playerInfo === 500) {
			await interaction.reply(locale === 'zh-TW'
				? { content: '伺服器連線異常，請稍後再試。', flags: MessageFlags.Ephemeral }
				: { content: 'Lodestone server error. Please try again later.', flags: MessageFlags.Ephemeral },
			);
			return;
		}
		if (!playerInfo) {
			await interaction.reply(locale === 'zh-TW'
				? { content: '查詢發生未知錯誤，請聯絡管理員。', flags: MessageFlags.Ephemeral }
				: { content: 'Unknown error occurred. Please contact admin.', flags: MessageFlags.Ephemeral },
			);
			return;
		}

		const fflogsLink = await fflogsSearch(playerInfo.name, playerInfo.world, playerInfo.dc);

		const embedData = JSON.parse(JSON.stringify(template.embed));
		embedData.title = `${playerInfo.name} @${playerInfo.world}`;
		embedData.url = lodestoneUrl;
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