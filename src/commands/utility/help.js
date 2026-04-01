const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('顯示機器人使用說明'),
    async execute(interaction) {
        const helpPath = path.join(__dirname, '..', '..', '..', 'doc', 'help_zhTW.md');
        let helpContent;
        try {
            helpContent = fs.readFileSync(helpPath, 'utf-8');
        }
        catch (error) {
            console.error(`Error reading help file: ${error}`);
            await interaction.reply({
                content: 'Sorry, I couldn\'t load the help information right now. 很抱歉，我現在無法載入幫助頁面。',
                ephemeral: true,
            });
            return;
        }
        await interaction.reply({
            content: helpContent,
            ephemeral: true,
        });
    },
};
