const { Buffer } = require('node:buffer');
const tmp = require("tmp-promise");
const fs = require("node:fs");
const util = require("node:util");
const child_process = require("node:child_process");
const config = require('../config/config.json');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const exec = util.promisify(child_process.exec);

tmp.setGracefulCleanup();

/**
 * Helper function for removing backgrounds, which takes its input and output as a base64 string.
 * The return value is a string on success, and null on error.
 * @param {string} input
 */
async function rembg(input) {
    const inputData = Buffer.from(input, "base64");

    const inputFile = await tmp.file();
    const outputFile = await tmp.file();
    try {
        await writeFile(inputFile.fd, inputData);
        const success = await exec(`${config.rembg} i ${inputFile.path} ${outputFile.path}`).then((_) => true, (err) => {
            logger.warn("remove_background error:");
            logger.warn(JSON.stringify(err));
            return false;
        });
        if (!success) {
            return null;
        }
        const outputData = await readFile(outputFile.fd);
        return outputData.toString("base64");
    } finally {
        await inputFile.cleanup();
        await outputFile.cleanup();
    }
}

function secondsToDhms(seconds) {
    seconds = Number(seconds)
    if (seconds === 0) {
        return "0 seconds";
    }

    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""

    const output = (dDisplay + hDisplay + mDisplay + sDisplay).trimEnd();
    if (output.endsWith(',')) {
        return output.slice(0, output.length - 1);
    } else {
        return output;
    }
}

module.exports = {
    rembg: rembg,
    secondsToDhms: secondsToDhms
}