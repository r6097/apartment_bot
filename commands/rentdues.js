const {google} = require('googleapis');
const { EmbedBuilder } = require('discord.js');
const sheets = google.sheets('v4');
const { SlashCommandBuilder } = require('discord.js');
const { rentTable } = require('../format-table.js');

const ENDPOINT = 'https://sheets.googleapis.com/v4/spreadsheets/';

// Set up the target payment month
const monthFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const d = new Date();
const monthName = monthFull[d.getMonth()];
const yearName = d.getFullYear();

// Create an alias to the fetch() function with a dynamic import
// See https://github.com/node-fetch/node-fetch#commonjs
const fetch = function(...args) {
	// Return a import promise
	return import('node-fetch')
		.then(function(module) {
			// Importing the default function: https://dmitripavlutin.com/ecmascript-modules-dynamic-import/#22-importing-of-default-export
			// Return the fetch promise with the supplied arguments
			return module.default(...args);
		});
};

/**
 * Fetch from Google Spreadsheets API for the cell's column who matches the payment period (the first match)
 * @returns {*} {False} If no data is found in the response, otherwise
 *              {String} Single character representing the column of the payment period
 */
<<<<<<< Updated upstream
async function getPaymentPeriod() {
	const target_url = ENDPOINT + process.env['SPREADSHEET_ID'] + '/values/2023_Bills!1:1?key=' + process.env['API_KEY'];
=======
async function getPaymentPeriod(jwtClient) {
>>>>>>> Stashed changes
	const targetPaymentPeriod = monthName + ' ' + yearName;
  
  const request = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.
    range: '2023_Bills!1:1',
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.get(request)).data;
    const header = response.values[0];
    if (header.length === 0) {
			console.log('No data found.');
			return false;
		}
		// Get the index/spreadsheet column of the target payment period
    // ascii code for 'A' is 65
    // but our array is indexed starting at 0
    // So begining at letter A, get the index of target period
    // add 1 to get next month's period
    const paymentColumn = String.fromCharCode(header.indexOf(targetPaymentPeriod) + 1 + 65);
    console.log('[getPaymentPeriod] :', JSON.stringify(paymentColumn, 0, 2));
    return paymentColumn;
  } catch (err) {
    console.error(err);
  }
}


/**
 * Fetch from Google Spreadsheets API to obtain rent dues
 * @param {string} paymentColumn - the column of the target payment period
 * @returns {*} {False} If no data is found in the response, otherwise
 *              {Array} Array of strings representing rent dues
 */
<<<<<<< Updated upstream
async function getRentDues(paymentColumn) {
	// Google Spreadsheet v4 batchGet api is not playing nice :c
	// Workaround is to do a do a batch of get requests bundled
	const promises = [];

	const ranges = getRanges(paymentColumn);

	for (const r of ranges) {
		const target_url = ENDPOINT + process.env['SPREADSHEET_ID'] + '/values/' + r + '?key=' + process.env['API_KEY'];
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
=======
async function getRentDues(paymentColumn, jwtClient) {
  
	const batch = [`2023_Bills!${paymentColumn}7`,
                  `2023_Bills!${paymentColumn}11`,
                  `2023_Bills!${paymentColumn}19`,
                  `2023_Bills!${paymentColumn}23`,
                  `2023_Bills!${paymentColumn}27`,
                  `2023_Bills!${paymentColumn}31`];
  
  const params = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.
    ranges: batch,
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.batchGet(params)).data;
    // console.log(response)
    const dues = response.valueRanges.map((batch) => {
      return batch.values[0][0]
    })
    console.log(dues)
    if (dues.length === 0){
			console.log('No data found.');
      return false;
    }
  	console.log('[getRentDues] :', JSON.stringify(dues, 0, 2));
    return dues;
  } catch (err) {
    console.log(err)
  }
  
>>>>>>> Stashed changes
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rentdues')
		.setDescription('Prints out rent dues from the apartment google sheet'),
	async execute(client, channel, interaction) {
		const paymentPeriodResult = await getPaymentPeriod(client.jwtClient);
		const rentDuesResult = await getRentDues(paymentPeriodResult, client.jwtClient);

		if (rentDuesResult.length > 0) {
      const table = rentTable(rentDuesResult);
			const embedResponse = new EmbedBuilder()
				.setColor(0X9900FF)
				.setTitle(`🙀 Rent Dues for ${monthName} ${yearName}!! 🙀`)
				.setURL(`${process.env['SHEET_LINK']}`)
<<<<<<< Updated upstream
				.setDescription(
					'```' + `${getTable(rentDuesResult, process.env['ROOMMATES'].split(','))}` + '```',
				);
=======
				.setFields(table);
>>>>>>> Stashed changes

			channel.send({ embeds: [embedResponse] });
			channel.send(`Link: ${process.env['APARTMENT_LOGIN_LINK']}`);
			channel.send('IMPORTANT: These show what you should pay-- If you paid already you are fine!');
			await interaction.reply('meow');
		}
		else {
			await interaction.reply('nyahthing here... all robert\'s fault');
		}
	},
};