const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { playerSearch } = require('../../utils/playerSearch.js');
const { fflogsSearch } = require('../../utils/fflogsSearch.js');
const { cooldown } = require('../utility/troller.js');


module.exports = {
	data: new SlashCommandBuilder().setName('refreshlist')
		.setDescription('Refresh the player name and links in GOOGLE Sheets.')
		.setDescriptionLocalizations(
			{
				'zh-TW': '更新GOOGLE表單玩家名稱及連結。',
			},
		),
	cooldown: 10,
	async execute(interaction) { 
        
    },

};