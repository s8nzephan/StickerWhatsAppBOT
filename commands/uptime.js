const WAWebJS = require("whatsapp-web.js");
const config = require("../config/config.json");
const { secondsToDhms } = require("../util/util.js");

const startDate = new Date();

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 */
async function plain(client, message, args) {
    const now = new Date();

    const duration = Math.floor((now - startDate) / 1000);
    await message.reply(secondsToDhms(duration));
}

module.exports = {
    invokers: ["uptime"],
    help: `Returns the bot's uptime.`,
    run: {
        plain: plain,
        reply: null,
        caption: null,
    }
}