const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('date')
		.setDescription('Returns numeral 1 to 31'),
	async execute(client, channel, interaction) {
		const today = new Date().getDate();
		await interaction.reply(`${today}`);
	},
};