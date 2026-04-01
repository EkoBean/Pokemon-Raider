const { SlashCommandBuilder } = require('discord.js');
const { playerSearch } = require('../../utils/playerSearch.js');

module.exports = {
    data: new SlashCommandBuilder().setName('troller')
        .setDescription('Catch a troller into pokemon bank.')
        .addIntegerOption(
            option => option.setName('lodestone_id')
                .setDescription('The troller\'s lodestone URL ID.')
                .setDescriptionLocalizations(
                    {
                        'zh-TW': '輸入戳仔的Lodestone號碼。',
                    }).setRequired(true)),
    cooldown: 5,
    dev: true,
    async execute(interaction) {
        const lodestoneId = interaction.options.getInteger('lodestone_id');
        const playerInfo = await playerSearch(lodestoneId);
        const locale = interaction.locale || interaction.user?.locale || 'en-US';

        if (locale === 'zh-TW') {
            await interaction.reply(
                `玩家名稱: ${playerInfo.name}\n World: ${playerInfo.world}\nData Center: ${playerInfo.dc}`,
            );
        }
        else {
            await interaction.reply(
                `Player Name: ${playerInfo.name}\nWorld: ${playerInfo.world}\nData Center: ${playerInfo.dc}`,
            );
        }
    },
};