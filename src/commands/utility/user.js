const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('user')
		.setDescription('Provides information about the user.')
		.setDescriptionLocalizations(
			{
				'zh-TW': '提供關於使用者的資訊。',
			},
		),
	async execute(interaction) {
		const locale = interaction.locale || interaction.user?.locale || 'en-US';
		if (locale === 'zh-TW') {
			await interaction.reply(
				`嗨， ${interaction.user.username}, 你加入這個伺服器的時間是 ${interaction.member.joinedAt}.`,
			);
		}
		else {
			await interaction.reply(
				`Hi, ${interaction.user.username}, you joined this server on ${interaction.member.joinedAt}.`,
			);
		}
	},
};