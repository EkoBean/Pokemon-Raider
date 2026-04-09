// const fs = require('node:fs');
// const path = require('node:path');
const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		if (message.content.trim().toLowerCase() === '!hello' || message.content.trim().toLowerCase() === '我要成為寶可夢大師') {
			await message.reply('嗨，準備踏上成為戳仔寶可夢大師之旅了嗎？在訊息框中打上/help就能獲得指令資訊，讓我們開始一起分享你在PF遇到的神人吧:)');
		}
	},
};