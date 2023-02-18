const {google} = require('googleapis');
const { EmbedBuilder } = require('discord.js');
const sheets = google.sheets('v4');
const { SlashCommandBuilder } = require('discord.js');
const { Table } = require('embed-table');
const { choresTable } = require('../format-table.js');


// Read first column of Leaderboards --> discordTags --> find callingDiscordTag's row from discordTags
async function getUser(callingDiscordTag, jwtClient) {
  
  const request = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.
    range: 'Leaderboards!A:A',
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.get(request)).data;
    const discordTags = response.values.flat();
    if (discordTags.length === 0) {
			console.log('No data found.');
			return false;
		}
		const rowOfUser = discordTags.indexOf(callingDiscordTag) + 1;
    console.log('[getUser] :', JSON.stringify(rowOfUser, 0, 2));
    return rowOfUser;
  } catch (err) {
    console.error(err);
  }
}

// Read first row of Leaderboards --> Header --> find targetEmoji's column in Header
async function getChore(targetEmoji, jwtClient) {
  const request = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.

    range: 'Leaderboards!1:1',
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.get(request)).data;
    const header = response.values[0];
    if (header.length === 0) {
			console.log('No data found.');
			return false;
		}
    const columnOfChore = String.fromCharCode(header.indexOf(targetEmoji) + 65);
		console.log('[getChore] :', JSON.stringify(columnOfChore, 0, 2));
    return columnOfChore;
  } catch (err) {
    console.error(err);
  }
	
}

// Locate cell to update using row, column --> add 1 to its value 
async function getAndUpdateChore(row, column, jwtClient) {
  var score = null; // Holds value to read/update
  // Read current value
  const getRequest = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],  
    // The A1 notation of the values to retrieve.
    range: `Leaderboards!${column}${row}`,  // TODO: Update placeholder value.
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.get(getRequest)).data;
    score = response.values[0][0];
  } catch (err) {
    console.error(err);
  }
  
  // Update value
  score = Number(score) + 1;
  const request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: process.env['SPREADSHEET_ID'],  
    // The A1 notation of the values to update.
    range: `Leaderboards!${column + row}`,  
    // How the input data should be interpreted.
    valueInputOption: 'USER_ENTERED',
    resource: {
      "values": [
        [score]
      ]
    },
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.update(request)).data;
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
}

// Read first column of Leaderboards --> discordTags --> find callingDiscordTag's row from discordTags
async function displayTable(jwtClient, channel) {
  const request = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.
    range: 'Leaderboards!A1:F7',
    auth: jwtClient,
  };
  
  try {
    const response = (await sheets.spreadsheets.values.get(request)).data;
    const table = choresTable(response);
    
    const embedResponse = new EmbedBuilder()
				.setColor(0X9900FF)
				.setTitle(`🙀 !?!?!Chore Leaderboard!?!?! 🙀`)
        .setFields(table);

		channel.send({ embeds: [embedResponse] });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('choreslist')
		.setDescription('Only does reactions right now but will produce the list of chores eventually'),
	async execute(client, channel, interaction) {
  	const message = await interaction.reply ({
      content: "Season 1 Bounties\nTrash: React with 🗑️\n Mail: React with 📬\nRecycling:React with ♻️\nReact with 🍽️\nDonut: React with 🍩\nSmoke Alarm: React with 🔥\n",
      fetchReply: true
    });
  	message.react('🗑️');
  	message.react('🍽️');
    message.react('📬');
  	message.react('♻️');
    message.react('🍩');
    message.react('🔥');
  
  	const filter = (reaction, user) => {
  		return (
        reaction.emoji.name === '🗑️' ||
        reaction.emoji.name === '🍽️' ||
        reaction.emoji.name === '📬' ||
        reaction.emoji.name === '♻️' ||
        reaction.emoji.name === '🍩' ||
        reaction.emoji.name === '🔥'
        ) &&
        user.id === interaction.user.id;
  	};
  
  	const collector = message.createReactionCollector({ filter, time: 10000 });
  
    collector.on('collect', async (reaction, user) => {
    	console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
      const userRow = await getUser(`${user.tag}`, client.jwtClient);
      const choreCol = await getChore(`${reaction.emoji.name}`, client.jwtClient);
      
      await getAndUpdateChore(userRow, choreCol, client.jwtClient);
      await displayTable(client.jwtClient, channel)
    });
  
    collector.on('end', collected => {
    	console.log(`Collected ${collected.size} items`);
    });
  },
};