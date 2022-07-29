const { Embed } = require('guilded.js');

module.exports = {
	name: 'instaboner',
	description: 'See your boner expand INSTANTLY!',
	usage: '[Someone]',
	aliases: ['instapp'],
	async execute(message, args, client) {
		try {
			// Get settings
			const srvconfig = await client.getData('guildedSettings', 'guildId', message.serverId);

			// Create initial embed
			const ppEmbed = new Embed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(`${args[0] ? args.join(' ') : message.member.user.name}'s pp size`);

			// Randomly pick between hard or soft
			const hard = Math.round(Math.random());

			// Chance of getting a SIKE u have no pp
			if (Math.round(Math.random() * 10) == 5) {
				ppEmbed.setDescription('SIKE').setFooter(`${args[0] ? args.join(' ') : message.member.user.name} has ${hard == 1 ? 'no pp' : 'erectile dysfunction'}`);
				return message.reply({ embeds: [ppEmbed] });
			}

			// Get random number out of the maxppsize for the amount of inches and set the description and footer to size then reply
			const random = Math.round(Math.random() * srvconfig.maxppsize);
			ppEmbed.setDescription('8' + '='.repeat(random - 1 == -1 ? 0 : random - 1) + 'D').setFooter(`${hard == 1 ? 'soft' : 'hard'} pp size = ${random}"`);
			message.reply({ embeds: [ppEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};