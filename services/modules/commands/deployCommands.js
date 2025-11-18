// Imports
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const LZUTF8 = require('lzutf8');

// Modules
const postgres_Module = require("../../postgres_service.js");
const config = require("../../../config/config.js");

async function loadCommandsFromFiles(commandFiles, commands) {
    for (const file of commandFiles) {
        const command = require(path.join(global.rootDir, `commands/${file}`));
        if ('data' in command && 'execute' in command) {
            //commands.push(command.data.toJSON());

            await processCommand(command, commands);
        } else {
            console.log(`WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`);
        }
    }
}

async function loadCommandsFromDirectory(directory, commandFilesInDir, commands) {
    for (const file of commandFilesInDir) {
        const command = require(path.join(global.rootDir, `commands/${directory}/${file}`));
        if ('data' in command && 'execute' in command) {
            //commands.push(command.data.toJSON());

            await processCommand(command, commands);
        } else {
            console.log(`WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`);
        }
    }
}

async function processCommand(command, commands) {
    /* const query = await postgres_Module.runQuery
    (
        `
            SELECT * FROM command_modules
            WHERE func_name='${command.data.name}'
        `
    )
    if (!query.rows.length) return; //Nic nedělej
    const row = query.rows[0];

    if(command.execute.toString() !== LZUTF8.decompress(row.func_text)) {
        const updateQuery = await postgres_Module.runQuery
        ({
            text: `
                UPDATE command_modules
                SET func_text = $1, updated_at = to_timestamp($2 / 1000.0)
                WHERE func_name = $3;
            `,
            values: [LZUTF8.compress(command.execute.toString()), Date.now(), command.data.name],
        });
    } else if(row.deployed === false) {
        const updateQuery = await postgres_Module.runQuery
        ({
            text: `
                UPDATE command_modules
                SET deployed = TRUE
                WHERE func_name = $1;
            `,
            values: [command.data.name],
        });
    } */
    return commands.push(command.data.toJSON());
}

async function deployCommands() {
    try {
        const commands = [];

        const commandFiles = fs.readdirSync(path.join(global.rootDir, 'commands'))
            .filter(file => file.endsWith('.js'));

        const getDirectories = fs.readdirSync(path.join(global.rootDir, 'commands'), { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        await loadCommandsFromFiles(commandFiles, commands);

        for (const directory of getDirectories) {
            const commandFilesInDir = fs.readdirSync(path.join(global.rootDir, 'commands', directory))
                .filter(file => file.endsWith('.js'));
            await loadCommandsFromDirectory(directory, commandFilesInDir, commands);
        }
        
        if(commands.lenght > 0) commands.forEach(e => { console.info(`-----  New changes to file ${e.name}.js  -----`)});

        const rest = new REST().setToken(config.TOKEN);
        console.log(`Started refreshing application slash commands globally.`);
        await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
        console.log('Successfully reloaded all commands!');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

module.exports = deployCommands;
