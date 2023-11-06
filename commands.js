const fs = require("node:fs");
const { logger } = require("./logger.js");

const registry = { run: {}, help: {} };

function registerCommands() {
    const commandsDir = fs.opendirSync("./commands");

    let count = 0;

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

function registerCommand(command) {
    const name = command.invokers[0];
    const helpText = `${command.invokers.join(", ")}: ${command.help}`;
    for (const invoker of command.invokers) {
        if (!/^\w+$/.test(invoker)) {
            logger.error(`Cannot register command '${name}': invoker '${invoker}' is invalid.`);
            return false;
        }
        if (invoker in registry.run) {
            logger.error(`Cannot register command '${name}': invoker '${invoker}' is already in use.`);
            return false;
        }

        registry.run[invoker] = command.run;
        registry.help[invoker] = helpText;
    }

    logger.info(`Registered command '${name}'.`);
    return true;
}

module.exports = {
    registry: registry,
    registerCommands: registerCommands
};