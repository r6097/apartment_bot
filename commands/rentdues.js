const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rentdues')
		.setDescription('Prints out rent dues from the apartment google sheet'),
	async execute(client, channel, interaction) {
        // For output and initial query
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const d = new Date();
        const monthName = month[d.getMonth()];
        const yearName = d.getFullYear()
        const targetPaymentPeriod = monthName + " " + yearName

        // gets list of first row columns
        const queryColumns = await client.googleSheets.values.get({
            auth: client.auth,
            spreadsheetId: client.spreadsheetId,
            range: "'2023 Bills'!1:1"
        })
        // ascii code for 'A' is 65
        // add 1 to get next month's period
        const paymentColumn = String.fromCharCode(queryColumns.data.values[0].indexOf(targetPaymentPeriod) + 1 + 65)

        // gets the rent dues for associated payment period
        const res = await client.googleSheets.values.batchGet({
            auth: client.auth,
            spreadsheetId: client.spreadsheetId,
            ranges: [`'2023 Bills'!${paymentColumn}7`, `'2023 Bills'!${paymentColumn}11`, `'2023 Bills'!${paymentColumn}19`, `'2023 Bills'!${paymentColumn}23`, `'2023 Bills'!${paymentColumn}27`, `'2023 Bills'!${paymentColumn}31`],
        })
        // Formats channel message as embed response
        if (res.data.valueRanges.length > 0) {
            let temp = []
            res.data.valueRanges.forEach( ({range, majorDimension, values}) => {
                temp.push(values[0][0])
            });
            
            const output = 
            `╔═════════╦═════════╗\n║ Brandon ║ ${temp[0]} ║\n╠═════════╬═════════╣\n║ James   ║ ${temp[1]} ║\n╠═════════╬═════════╣\n║ Nathan  ║ ${temp[2]} ║\n╠═════════╬═════════╣\n║ Robert  ║ ${temp[3]} ║\n╠═════════╬═════════╣\n║ Weimen  ║ ${temp[4]} ║\n╠═════════╬═════════╣\n║ Yen     ║ ${temp[5]} ║\n╚═════════╩═════════╝`;

            const embedResponse = new EmbedBuilder()
                .setColor(0X9900FF)
                .setTitle(`🙀 Rent Dues for ${monthName} ${yearName}!! 🙀`)
                .setURL('https://docs.google.com/spreadsheets/d/1EiiR4190q2mqJDlTvUZOtsBbMGfea5eiheyET-0YUNQ/edit#gid=1930706445')
                .setDescription(
                    "```" + `${output}` + "```"
                );

            channel.send({ embeds: [embedResponse] })
            channel.send("IMPORTANT: These show what you should pay-- If you paid already you are fine!")
            await interaction.reply('meow');
        } else {
            await interaction.reply(`nyahthing here... all robert's fault`);
        }
	},
};