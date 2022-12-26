/**
 * Checks if today is at least 7 days before the end of the month, then pings everyone to pay rent
 * @param {import("discord.js").GuildBasedChannel} channel - The discord channel where the message
 * 													will be sent to
 */
function rentReminder(channel) {
	const day = new Date();
	const [year, month] = [day.getFullYear(), day.getMonth()];

	const lastDay = new Date(year, month + 1, 0).getDate();
	const today = new Date().getDate();

	if (lastDay - today < 7) {
		channel.send('@everyone meow meow, rent is due soon!');
		channel.send(`Link: ${process.env.APARTMENT_LOGIN_LINK}`);
		channel.send('check your amount due with `\\rentdues`');
	}

}

module.exports = {
	rentReminder,
};