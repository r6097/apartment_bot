const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const { getRanges, getTable } = require('../rent-table.js');

const ENDPOINT = 'https://sheets.googleapis.com/v4/spreadsheets/';

// Set up the target payment month
const monthFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const d = new Date();
const monthName = monthFull[d.getMonth()];
const yearName = d.getFullYear();

/**
 * Fetch from Google Spreadsheets API for the cell's column who matches the payment period (the first match)
 * @returns {*} False - If no data is found in the response, otherwise
 *              String - Single character representing the column of the payment period
 *              0 - In case of error during api call
 */
async function getPaymentPeriod() {
	const target_url = ENDPOINT + process.env.SPREADSHEET_ID + '/values/2023_Bills!1:1?key=' + process.env.API_KEY;
	const targetPaymentPeriod = monthName + ' ' + yearName;
	// console.log(target_url)
	try {
		let response = await fetch(target_url);
		response = await response.json();
		// extract values from response object
		// console.log("[getPaymentPeriods] :", JSON.stringify(response, 0, 2));
		const header = response.values[0];
		if (header.length === 0) {
			console.log('No data found.');
			return false;
		}
		else {
			// Get the index/spreadsheet column of the target payment period
			// ascii code for 'A' is 65
			// add 1 to get next month's period
			const paymentColumn = String.fromCharCode(header.indexOf(targetPaymentPeriod) + 1 + 65);
			console.log('[getPaymentPeriod] :', JSON.stringify(paymentColumn, 0, 2));
			return paymentColumn;
		}
	}
	catch (error) {
		console.log(error);
		return 0;
	}
}


/**
 * Fetch from Google Spreadsheets API to obtain rent dues
 * @param {string} paymentColumn - the column of the target payment period
 * @returns {Array} Array of strings representing rent dues
 */
async function getRentDues(paymentColumn) {
	// Google Spreadsheet v4 batchGet api is not playing nice :c
	// Workaround is to do a do a batch of get requests bundled
	const promises = [];

	const ranges = getRanges(paymentColumn);

	for (const r of ranges) {
		const target_url = ENDPOINT + process.env.SPREADSHEET_ID + '/values/' + r + '?key=' + process.env.API_KEY;
		const res = await fetch(target_url);
		promises.push(res.json());
	}

	// Holds output of fufilled promises
	const fufills = [];

	await Promise.all(promises).then((data) => {
		data.forEach((o) => {
			fufills.push(o.values[0][0]);
		});
	});

	console.log('[getRentDues] :', JSON.stringify(fufills, 0, 2));
	return fufills;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rentdues')
		.setDescription('Prints out rent dues from the apartment google sheet'),
	async execute(client, channel, interaction) {
		const paymentPeriodResult = await getPaymentPeriod();
		const rentDuesResult = await getRentDues(paymentPeriodResult);

		if (rentDuesResult.length > 0) {
			const embedResponse = new EmbedBuilder()
				.setColor(0X9900FF)
				.setTitle(`🙀 Rent Dues for ${monthName} ${yearName}!! 🙀`)
				.setURL(`${process.env.SHEET_LINK}`)
				.setDescription(
					'```' + `${getTable(rentDuesResult, process.env.ROOMMATES.split(','))}` + '```',
				);

			channel.send({ embeds: [embedResponse] });
			channel.send(`Link: ${process.env.APARTMENT_LOGIN_LINK}`);
			channel.send('IMPORTANT: These show what you should pay-- If you paid already you are fine!');
			await interaction.reply('meow');
		}
		else {
			await interaction.reply('nyahthing here... all robert\'s fault');
		}
	},
};