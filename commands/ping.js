const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with meow!'),
	async execute(client, channel, interaction) {
		await interaction.reply('meow');
	},
};