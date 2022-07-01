const fs = require('fs');
const YAML = require('yaml');
const { Client } = require('guilded.js');

// Load the config and login the guilded client
const { token } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));
const client = new Client({ token });

// Set type for later use and startTimestamp for ready counter
client.startTimestamp = Date.now();

// Load the universal and guilded-specific handlers
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(client);