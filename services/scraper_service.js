// Imports
const fs = require('fs');
const path = require('path');
const { Client, Collection } = require('discord.js');

// Modules

// Variables
const module_paths = path.join(global.rootDir, 'services/modules/scraper')

// Functions
//

// Export
const files = fs.readdirSync(module_paths)
            .filter(file => file.endsWith('.js'))

for(const file of files) {
    module.exports[file.split(".js")[0]] = require(module_paths + "/" + file)
}