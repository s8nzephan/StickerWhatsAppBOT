async function reply(client, message, args) {
    const match = args.match(/^(.+) \| (.+)$/);
    if (match === null) {
        await message.reply("Invalid format. Usage: change <name> | <author>");
        return;
    }

    const name = match[1];
    const author = match[2];

    const quotedMsg = await message.getQuotedMessage();
    if (!quotedMsg.hasMedia) {
        await message.reply("Quoted message doesn't have any media!");
        return;
    }

    const loading = await message.reply("*[⏳]* Loading..");
    const media = await quotedMsg.downloadMedia();
    await message.reply(media, null, {
        sendMediaAsSticker: true,
        stickerName: name,
        stickerAuthor: author
    });
    await loading.delete(true);
}

module.exports = {
    invokers: ["change"],
    help: "Change a sticker's metadata. Usage: change <name> | <author>",
    run: {
        plain: null,
        reply: reply,
        caption: null,
    }
}