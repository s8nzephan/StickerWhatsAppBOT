const { logger } = require("../logger.js");
const config = require('../config/config.json');

async function inner(client, message, args, downloadMedia) {
    let name, author;
    if (args.length > 0) {
        const match = args.match(/^(.+) \| (.+)$/);
        if (match === null) {
            await message.reply(`Invalid format. Usage: ${config.prefix}sticker <name> | <author>`);
            return;
        }

        name = match[1];
        author = match[2];
    } else {
        name = config.name;
        author = config.author;
    }

    const loading = await message.reply("*[⏳]* Loading..");
    const media = await downloadMedia();

    await message.reply(media, null, {
        sendMediaAsSticker: true,
        stickerName: name,
        stickerAuthor: author
    });
    await loading.delete(true);
}

async function reply(client, message, args) {
    const quotedMsg = await message.getQuotedMessage();
    if (quotedMsg.hasMedia) {
        await inner(client, message, args, async () => await quotedMsg.downloadMedia());
    } else {
        await message.reply("Quoted message doesn't have any media!");
    }
}

async function caption(client, message, args) {
    await inner(client, message, args, async () => await message.downloadMedia());
}

module.exports = {
    invokers: ["sticker", "s"],
    help: "Create a sticker from an image.",
    run: {
        plain: null,
        reply: reply,
        caption: caption,
    }
}