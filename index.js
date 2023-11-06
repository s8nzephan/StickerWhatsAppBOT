const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const colors = require('colors');
const fs = require('fs');
const { logger } = require("./logger.js");

const config = require('./config/config.json');
const { registerCommands, registry } = require("./commands.js");
// const { exit } = require('process');
// exit()


const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({ clientId: "client" })
});


client.on('qr', (qr) => {
    logger.info("Scan the QR below to authenticate:");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    const consoleText = './config/console.txt';
    fs.readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            logger.warn("console.text not found!");
        } else {
            console.log(data.green);
        }
        registerCommands();
        logger.info(`${config.name} is ready!`);
    });
});

client.on('message', async (message) => {
    const isGroups = message.from.endsWith('@g.us');
    if (isGroups !== config.groups) { return; }

    client.getChatById(message.id.remote).then(async (chat) => {
        await chat.sendSeen();
    });

    let type, content;
    if ((message.type === "image" || message.type === "video" || message.type === "gif")) {
        type = "caption";
        content = message._data.caption;
    } else {
        if (message.hasQuotedMsg) {
            type = "reply";
        } else {
            type = "plain";
        }
        content = message.body;
    }

    if (!content.startsWith(config.prefix)) { return; }
    const noPrefix = content.slice(config.prefix.length);
    const indexOfSpace = noPrefix.indexOf(" ");

    let command, args;
    if (indexOfSpace === -1) {
        command = noPrefix;
        args = "";
    } else {
        command = noPrefix.slice(0, indexOfSpace);
        args = noPrefix.slice(indexOfSpace).trim();
    }

    if (!(command in registry.run)) { return; }
    try {
        if (!registry.run[command][type]) {
            await message.reply("Command doesn't support this type of invocation.");
            return;
        } else {
            await registry.run[command][type](client, message, args);
        }
    } catch (err) {
        logger.error(`Error when running command '${command}': `, err);
        await message.reply("Error when running command! See console for details.");
    }
});

console.clear();
logger.info(`${config.name} is initializing...`);
client.initialize();
