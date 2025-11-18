// Imports
const fs = require('fs');
const path = require('path');
const LZUTF8 = require('lzutf8');

// Modules
const postgres_Module = require("../../postgres_service.js");

// Functions
loadCommands = async (data) => {
    const commandsPath = path.join(global.rootDir, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const getDirectories = fs.readdirSync(path.join(global.rootDir, 'commands'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    loadCommandFiles.call(this, commandFiles, commandsPath, data);
    loadCommandDirectories.call(this, getDirectories, data);

    return data;
}

const loadCommandFiles = function (commandFiles, commandsPath, data) {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            //data.set(command.data.name, command);
            processCommand(command, data);
        } else {
            console.log(`The Command ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

const loadCommandDirectories = function (getDirectories, data) {
    for (const directory of getDirectories) {
        const commandFilesInDir = getCommandFilesInDirectory(directory);
        for (const file of commandFilesInDir) {
            const command = requireCommand(directory, file);
            if (isValidCommand(command)) {
                processCommand(command, data);
            } else {
                logInvalidCommand(file);
            }
        }
    }
};

function getCommandFilesInDirectory(directory) {
    return fs.readdirSync(path.join(global.rootDir, 'commands/' + directory))
        .filter(file => file.endsWith('.js'));
}

function requireCommand(directory, file) {
    return require(path.join(global.rootDir, `commands/${directory}/${file}`));
}

function isValidCommand(command) {
    return 'data' in command && 'execute' in command;
}

function processCommand(command, data) {
    /* postgres_Module.runQuery({
        text: `
            SELECT * FROM command_modules
            WHERE func_name='${command.data.name}'
        `,
        rowMode: "array",
    }).then(x => {
        if (x.rows.length) return;
        const compressdString = LZUTF8.compress(command.execute.toString());
        const query = {
            text: 'INSERT INTO command_modules(func_name, func_text) VALUES($1, $2)',
            values: [command.data.name, compressdString],
        };
        postgres_Module.runQuery(query);

        console.log(`Added to TABLE command_modules - ${command.data.name}`)
    }); */
    data.set(command.data.name, command);

    if(command.__init__) command.__init__();
}

function logInvalidCommand(file) {
    console.log(`WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`);
}

// Module Export
module.exports = loadCommands;