# ApartmentBot
![image of apartmentbot](https://i.imgur.com/UCSRL0S.jpg)

A discord bot that helps manage the apartment I live in. It is built using the Discord and Google APIs to transmit data from a spreadsheet to a discord server. It sends a reminder to the discord server when rent is due in a week or less.

## Commands
Its commands are tailored to access a spreadsheet of particular format. If modifying this, make sure to change the fields to match your spreadsheet.

- `/ping` - Check if the bot is responsive.
- `/date` - Bot sends the current date.
- `/rentdues` - Bot sends a table containing the amount needed to pay for the current month's rent
- `/choreslist` - Bot sends a message that users can react to for a limited time. On a reaction, the bot will post an updated table of chores completed. 

## Jobs
This Discord bot also performs scheduled jobs via the [node-cron](https://github.com/kelektiv/node-cron) package.

| Function | Description | Schedule |
|----------|-------------|----------|
|`rentReminder`| Messages the `GENERAL_CHANNEL` to pay rent. | Within 7 days of end of month, at 10:00 and 18:00 |

## Events
`messageCreate`- Anytime a user other than ApartmentBot messages the channel `GENERAL_CHANNEL`, there is a random chance ApartmentBot will reply to the message. The message itself is a randomly picked from a distribution of messages.

## Configuration
This assumes that you have a Discord bot set up beforehand and a project on Google Cloud Console. I followed this [guide](https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/). Its keys/ids are stored in an `.env` file.

| Name      | Description |
| ----------- | ----------- |
| TOKEN      | Discord Bot Token       |
| CLIENT_ID   | Discord Auth Client ID        |
| GUILD_ID      | ID of the Discord Server       |
| GENERAL_CHANNEL      | ID of the Channel the bot posts in       |
| SPREADSHEET_ID   | ID of the Google Spreadsheet        |
| API_KEY   | An API Key from your project on Google Cloud Console        |
| SHEET_LINK*     | Link to rent dues spreadsheet       |
| APARTMENT_LOGIN_LINK*     | Link to apartment account portal       |
| ROOMMATES*     | String of names       |

 *: These values are not vital for function.
 
---
### Rent Reminder Config
> The reminder is currently scheduled to be sent at 10:00 and 18:00.

- To change the hours when the bot sends the rent reminder, edit the cron job in `index.js`.
```js
const checkRentDues = new cron.CronJob(
	'0 0 10,18 * * *',
	() => {
		const guild = client.guilds.cache.get(process.env['GUILD_ID']);
		const channel = guild.channels.cache.get(process.env['GENERAL_CHANNEL']);
		rentReminder(channel);
	},
	null,
	true,
	'America/Los_Angeles',
);
```

> The rent reminder is only sent when the current day is a week (7) away from the due date, or less.

- To change the days when it can send the reminder, edit the rentReminder function in `jobs.js`.
```js
if (lastDay - today < 7) {
	channel.send('@everyone! Rent is due soon!');
	channel.send(`Link: ${process.env.APARTMENT_LOGIN_LINK}`);
	channel.send('Check your amount due with `\\rentdues`');
}
```
---
### Interfacing with your spreadsheet
The bot is linked to a Google Cloud service account that allows us to integrate Google Cloud APIs. How do you set this up?
1. Create a project for your bot in the Google Cloud Console
2. Go to APIs & Services >> Credentials >> Create Service Account
3. With the the Service Account email, add it to your target spreadsheet
4. Follow the Sheets API reference on how to use the Node.js library to make http requests

Example in the app
```
// Example Header
const request = {
    // The ID of the spreadsheet to retrieve data from.
    spreadsheetId: process.env['SPREADSHEET_ID'],
    // The A1 notation of the values to retrieve.
    range: 'Leaderboards!A:A',
    auth: jwtClient,
  };
 
 ...
 
 // Using sheets api
 await sheets.spreadsheets.values.get(request)).data
```


## Set up
1. Install dependencies\
`npm install`
2. Load/Reload discord commands\
`node deploy-commands.js`
3. Start the app\
`npm start`
---
## Quick Links
[https://discord.com/developers/applications](https://discord.com/developers/applications)\
[https://discord.js.org/#/](https://discord.js.org/#/)\
[Replit Link](https://replit.com/@RobertAu/apartmentbot)\
[UptimeRobot](https://uptimerobot.com/dashboard)
