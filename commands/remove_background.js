const WAWebJS = require("whatsapp-web.js");
const { rembg } = require("../util/util.js");
const config = require('../config/config.json');

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 * @param {() => Promise<WAWebJS.MessageMedia>} downloadMedia
 */
async function inner(client, message, args, downloadMedia) {
    const loading = await message.reply("*[⏳]* Loading..");
    const media = await downloadMedia();

    const no_bg = await rembg(media.data);
    if (no_bg !== null) {
        const newMedia = new WAWebJS.MessageMedia("image/png", no_bg);
        await message.reply(newMedia);
    } else {
        await message.reply("Error! See console for details.");
    }
    await loading.delete(true);
}

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 */
async function reply(client, message, args) {
    const quotedMsg = await message.getQuotedMessage();
    if (quotedMsg.hasMedia) {
        await inner(client, message, args, async () => await quotedMsg.downloadMedia());
    } else {
        await message.reply("Quoted message doesn't have any media!");
    }
}

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 */
async function caption(client, message, args) {
    await inner(client, message, args, async () => await message.downloadMedia());
}

module.exports = {
    invokers: ["remove_background", "rembg", "rmbg"],
    help: "Remove the background from an image and send it as a sticker.",
    run: {
        plain: null,
        reply: reply,
        caption: caption,
    }
}