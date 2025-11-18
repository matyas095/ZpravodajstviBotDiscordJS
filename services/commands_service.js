// Imports
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// Modules
const deployCommands = require("./modules/commands/deployCommands.js");
const loadCommands = require("./modules/commands/loadCommands.js")

// Functions
//

// Export
module.exports = {
    deployCommands,
    loadCommands
}