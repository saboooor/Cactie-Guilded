const { Embed } = require('guilded.js');
module.exports = {
	name: 'ping',
	description: 'Pong!',
	aliases: ['pong'],
	cooldown: 10,
	async execute(message, args, client, lang) {
		try {
			// Create embed with ping information and add ping again button
			const PingEmbed = new Embed()
				.setColor(0x32343d)
				.setTitle(lang.pong)
				.setDescription(`**${lang.ping.latency}** ${Date.now() - message.createdAt}ms`);

			// reply with embed
			message.reply({ embeds: [PingEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};