const WAWebJS = require("whatsapp-web.js");

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 */
async function reply(client, message, args) {
    const quotedMsg = await message.getQuotedMessage();
    if (quotedMsg.hasMedia) {
        const loading = await message.reply("*[⏳]* Loading..");

        const media = await quotedMsg.downloadMedia();
        await message.reply(media);
        await loading.delete(true);
    } else {
        await message.reply("Quoted message doesn't have any media!");
    }
}

module.exports = {
    invokers: ["image"],
    help: "Get the image from a sticker.",
    run: {
        plain: null,
        reply: reply,
        caption: null,
    }
}