const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('你說乒我說乓 :D'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};