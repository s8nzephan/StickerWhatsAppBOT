const WAWebJS = require("whatsapp-web.js");
const { logger } = require("../logger.js");
const config = require('../config/config.json');
const minimist = require("../util/minimist-string.js");
const { rembg } = require("../util/util.js");

/**
 * @param {WAWebJS.Client} client
 * @param {WAWebJS.Message} message
 * @param {string} args
 * @param {() => Promise<WAWebJS.MessageMedia>} downloadMedia
 */
async function inner(client, message, args, downloadMedia) {
    const parsed = minimist(args, {
        alias: {
            n: "name",
            a: "author",
            r: "remove-background"
        }
    });

    const name = "name" in parsed ? parsed.name : config.name;
    const author = "author" in parsed ? parsed.author : config.author;

    const loading = await message.reply("*[⏳]* Loading..");
    const media = await downloadMedia();

    let outputMedia;
    if (parsed["remove-background"]) {
        const no_bg = await rembg(media.data);
        if (no_bg !== null) {
            outputMedia = new WAWebJS.MessageMedia("image/png", no_bg);
        } else {
            await message.reply("Error! See console for details.");
            await loading.delete(true);
        }
    } else {
        outputMedia = media;
    }

    await message.reply(outputMedia, null, {
        sendMediaAsSticker: true,
        stickerName: name,
        stickerAuthor: author
    });
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
    invokers: ["sticker", "s"],
    help: `Create a sticker from an image.
Arguments:
\`\`\`
-n, --name <string>      Specify the name that will appear on the sticker.
-a, --author <string>    Specify the author that will appear on the sticker.
-r, --remove-background  Remove the background from the given image.
\`\`\`
Examples:
${config.prefix}sticker
${config.prefix}sticker -n Funny -a "Chandler Bing"
${config.prefix}s -r
${config.prefix}sticker --author Banksy --name "Banana Bread" --remove-background`,
    run: {
        plain: null,
        reply: reply,
        caption: caption,
    }
}