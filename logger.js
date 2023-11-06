const { createLogger, format, transports } = require('winston');
const process = require("process");

const myFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${process.env.NOTIMESTAMP ? "" : timestamp + " "}[${level}]: ${message} `
    if (metadata && Object.keys(metadata).length !== 0) {
        msg += JSON.stringify(metadata)
    }
    return msg
});

module.exports.logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.splat(),
        format.timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console()
    ]
});

