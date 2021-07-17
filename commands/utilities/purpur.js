const Discord = require('discord.js');
require('moment-duration-format');
const moment = require('moment');
const fetch = require('node-fetch');
module.exports = {
	name: 'purpur',
	description: 'Get info on the latest Purpur build',
	usage: '[Version] [Build]',
	options: [{
		type: 3,
		name: 'version',
		description: 'Specify a Minecraft version',
	},
	{
		type: 3,
		name: 'build',
		description: 'Specify a Purpur build number',
	}],
	async execute(message, args, client) {
		if (message.type && message.type == 'APPLICATION_COMMAND') {
			args = Array.from(args);
			args.forEach(arg => args[args.indexOf(arg)] = arg[1].value);
		}
		// fetch the latest mc version
		const a = await fetch('https://api.pl3x.net/v2/purpur');
		const b = await a.json();
		// if specified args are valid then replace latest with that number
		const c = args[0] ? args[0] : b.versions[0];
		const d = args[1] ? args[1] : 'latest';
		// fetch the latest build for mc / build versions specified or latest
		const e = await fetch(`https://api.pl3x.net/v2/purpur/${c}/${d}`);
		const f = await e.json();
		// check if error
		if (f.error) return message.reply(f.error.message);
		// initial embed creation
		const Embed = new Discord.MessageEmbed()
			.setColor(9790364)
			.setTitle(`Purpur ${f.version} build ${f.build} (${f.result})`)
			.setThumbnail('https://cdn.discordapp.com/attachments/742476351012864162/865391752675065896/purpur.png')
			.setDescription(`${f.commits.length} commit(s)`)
			.setFooter(`${moment(f.timestamp)}`);
		// add fields for commits
		f.commits.forEach(commit => { Embed.addField(commit.author, `${commit.description}\n*${moment(commit.timestamp)}*`); });
		// add field for download
		Embed.addField('Download', `[Click Here](https://api.pl3x.net/v2/purpur/${c}/${d}/download)`);
		// send embed
		message.reply({ embeds: [Embed] });
	},
};