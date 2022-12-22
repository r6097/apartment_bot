const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, guildId, generalChannel, spreadsheet_id } = require('./config.json');
// load cron jobs
var cron = require("cron");
const { rentReminder } = require('./jobs.js')
// for using google api
const {google} = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');
const sheets = google.sheets('v4');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load the commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
		console.log(`[LOADED] ${command.data.name}`)
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

    // Periodically send rent reminder if:
    // 1) is due in seven days or sooner AND
    // 2) at 10AM and 6PM, pinging everyone
    let checkRentDues = new cron.CronJob('0 0 10,18 * * *', () => {
        const guild = client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(generalChannel);
        rentReminder(channel);
    })

    checkRentDues.start()
});

// Handle interaction 
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		const guild = client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(generalChannel);
		await command.execute(client, channel, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Google Spreadsheet API
(async () => {
	const auth = await authenticate({
		keyfilePath: path.join(__dirname, './credentials.json'),
		scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly'
	});
	google.options({auth});

	client.auth = auth;
	client.googleSheets = sheets.spreadsheets;
	client.spreadsheetId = spreadsheet_id;
})();



// Log in to Discord with your client's token
client.login(token);
