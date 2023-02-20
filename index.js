//  busybox reboot
const fs = require('node:fs');
const path = require('node:path');
const {JWT} = require('google-auth-library');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
// Load keys/ids related to discord bot application and google api
require('dotenv').config();

// load cron jobs
const cron = require('cron');
const { rentReminder } = require('./jobs.js');

// Web server stuff -- for UptimeRobot
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('I\'m alive!'));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`),
);

// Discord Bot Code

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });
//const client = new Client({ intents: 32767 });
// Load the commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`[LOADED] ${command.data.name}`);
  }
  else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  const guild = client.guilds.cache.get(process.env['GUILD_ID']);
  const channel = guild.channels.cache.get(process.env['GENERAL_CHANNEL']);
  // Periodically send rent reminder if:
  // 1) is due in seven days or sooner AND
  // 2) at 10AM and 6PM, pinging everyone
  
  const checkRentDues = new cron.CronJob(
    '0 0 10,18 * * *',
    () => {

      rentReminder(channel);
    },
    null,
    true,
    'America/Los_Angeles',
  );

  checkRentDues.start();
});

// Handle interaction
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    const guild = client.guilds.cache.get(process.env['GUILD_ID']);
    const channel = guild.channels.cache.get(process.env['GENERAL_CHANNEL']);
    await command.execute(client, channel, interaction);
  }
  catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Debug for discord client
client.on('debug', console.log).on('warning', console.log);

// Embed jwtClient in discord client
// Initialize and authorize client to use Google APIs
// via service account key
client.jwtClient = new JWT({
       email: process.env['client_email'],
       key: process.env['private_key'],
       scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

// Handle Discord rate limit from using shared IP

// Log in to Discord with your client's token
client.login(process.env['TOKEN']);