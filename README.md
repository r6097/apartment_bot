# ApartmentBot
A discord bot that helps manage the apartment I live in. It is built using the Discord and Google APIs to transmit data from a spreadsheet to a discord server. It sends a reminder to the discord server when rent is due in a week or less.

## Commands
Its commands are tailored to access a spreadsheet of particular format. If modifying this, make sure to change the fields to match your spreadsheet.

- `/ping` - Check if the bot is responsive.
- `/date` - Returns the current date.
- `/rentdues` - Returns a table containing the amount needed to pay for the current month's rent.

## Jobs
This Discord bot also performs scheduled jobs via the [node-cron](https://github.com/kelektiv/node-cron) package.

| Function | Description | Schedule |
|----------|-------------|----------|
|`rentReminder`| Messages the `GENERAL_CHANNEL` to pay rent. | Within 7 days of end of month, at 10:00 and 18:00 |


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
### Reading your spreadsheet
The bot uses the Google Sheets API through the protocols described in https://developers.google.com/sheets/api/samples/reading

1. The bot finds the target payment period column with one get request.
    - `const target_url = ENDPOINT + process.env.SPREADSHEET_ID + '/values/{your spreadsheet tab name}!{the range your target cell is in}?key=' + process.env.API_KEY;`
3. The bot finds the amount due with a batch of get requests.
    - You should make a `rent-table.js` that performs function `getRanges`.

	```js
	const getRanges = (paymentColumn) => {
	 	return (
			[`2023_Bills!${paymentColumn}7`, `2023_Bills!${paymentColumn}11`, `2023_Bills!${paymentColumn}19`, 
			`2023_Bills!${paymentColumn}23`, `2023_Bills!${paymentColumn}27`, `2023_Bills!${paymentColumn}31`]
		);
	};
	```
    - The numbers after `${paymentColumn}` represent the row for each roommate.
    - Use the same protocol in (1), but with these ranges.


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
