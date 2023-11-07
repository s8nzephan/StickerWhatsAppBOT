const WAWebJS = require("whatsapp-web.js");
const fs = require("node:fs");
const { logger } = require("./logger.js");
const config = require("./config/config.json");

const registry = { run: {}, help: {}, alias_list: {}, main_names: [] };

function registerCommands() {
    const commandsDir = fs.opendirSync("./commands");

    registerHelp();
    let count = 1;

    let entry;
    while ((entry = commandsDir.readSync()) !== null) {
        if (!entry.isFile()) continue;

        const command = require(`./commands/${entry.name}`);
        if (registerCommand(command)) {
            count += 1;
        }
    }
    commandsDir.closeSync();

    logger.info(`Registered ${count} valid command${count > 1 ? 's' : ''} in total.`);
}

function registerHelp() {
    /**
     * @param {WAWebJS.Client} client
     * @param {WAWebJS.Message} message
     * @param {string} args
     */
    async function runHelp(client, message, args) {
        if (args.length === 0) {
            let output = "Here are the commands:\n";
            for (const name of registry.main_names) {
                output += `  ${config.prefix}${name}\n`;
            }
            output += `\nTo get help about a specific command, use ${config.prefix}help <command>.`;

            await message.reply(output);
        } else {
            let command;
            if (args.startsWith(config.prefix)) {
                command = args.slice(config.prefix.length);
            } else {
                command = args;
            }

            if (!(command in registry.run)) {
                await message.reply("Invalid command!");
                return;
            }

            const output =
                `Help for command ${config.prefix}${command}:

Aliases: ${registry.alias_list[command].join(", ")}
${registry.help[command]}`;

            await message.reply(output);
        }
    }

    registry.run.help = {
        plain: runHelp,
        reply: runHelp,
        caption: runHelp
    };
    registry.help.help = `Get help about a command. Usage: ${config.prefix}help <command>`;
    registry.alias_list.help = ["help"];
    registry.main_names.push("help");
}

function registerCommand(command) {
    const name = command.invokers[0];

    for (const invoker of command.invokers) {
        if (!/^\w+$/.test(invoker)) {
            logger.error(`Cannot register command '${name}': invoker '${invoker}' is invalid.`);
            return false;
        }
        if (invoker in registry.run) {
            logger.error(`Cannot register command '${name}': invoker '${invoker}' is already in use.`);
            return false;
        }
    }
    for (const invoker of command.invokers) {
        registry.run[invoker] = command.run;
        registry.help[invoker] = command.help;
        registry.alias_list[invoker] = command.invokers;
    }
    registry.main_names.push(name);

    logger.info(`Registered command '${name}'.`);
    return true;
}

module.exports = {
    registry: registry,
    registerCommands: registerCommands
};