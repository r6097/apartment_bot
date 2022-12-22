const { apartment_login_link } = require("./config.json");

// Checks if today is at least 7 days before the end of the month,
// then pings everyone to pay rent
function rentReminder(channel) {
    const day = new Date()
    const [year, month] = [day.getFullYear(), day.getMonth()]

    lastDay = new Date(year, month + 1, 0).getDate()
    today = new Date().getDate()

    if (lastDay-today < 7) {
        channel.send("@everyone meow meow, rent is due soon!")
        channel.send("check your amount due with `\\rentdues`")
    }

}

module.exports = {
    rentReminder
};