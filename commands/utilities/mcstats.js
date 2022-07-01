const { Embed } = require('guilded.js');
const { createPaste } = require('hastebin');
const protocols = require('../../lang/int/mcprotocol.json');
module.exports = {
	name: 'mcstats',
	description: 'Get the status of a Minecraft server',
	aliases: ['mcstatus'],
	usage: '<Server IP>',
	async execute(message, args, client) {
		try {
			const StatsEmbed = new Embed()
				.setColor(0x32343d)
				.setImage(`https://api.loohpjames.com/serverbanner.png?ip=${args[0]};width=918`);
			const iconpng = [];
			const json = await fetch(`https://api.mcsrvstat.us/2/${args[0]}`);
			const pong = await json.json();
			if (!pong.online) return message.reply({ content: '**Invalid Server IP**' });
			if (pong.hostname) StatsEmbed.setTitle(pong.hostname);
			else if (pong.port == 25565) StatsEmbed.setTitle(pong.ip);
			else StatsEmbed.setTitle(`${pong.ip}:${pong.port}`);
			if (pong.debug.cachetime) StatsEmbed.setDescription(`Last Pinged: \`${new Date(parseInt(pong.debug.cachetime + '000'))}\``);
			else StatsEmbed.setDescription(`Last Pinged: \`${Date.now()}\``);
			if (pong.version) StatsEmbed.addFields([{ name: '**Version:**', value: pong.version, inline: true }]);
			if (pong.protocol != -1 && pong.protocol) StatsEmbed.addFields([{ name: '**Protocol:**', value: `${pong.protocol} (${protocols[pong.protocol]})`, inline: true }]);
			if (pong.software) StatsEmbed.addFields([{ name: '**Software:**', value: pong.software, inline: true }]);
			if (pong.players) StatsEmbed.addFields([{ name: '**Players Online:**', value: `${pong.players.online} / ${pong.players.max}`, inline: true }]);
			if (pong.players && pong.players.list && pong.players.online > 50) {
				const link = await createPaste(pong.players.list.join('\n'), { server: 'https://bin.birdflop.com' });
				StatsEmbed.addFields([{ name: '**Players:**', value: `[Click Here](${link})`, inline: true }]);
			}
			else if (pong.players && pong.players.list) {
				StatsEmbed.addFields([{ name: '**Players:**', value: pong.players.list.join('\n').replace(/_/g, '\\_') }]);
			}
			if (pong.motd) StatsEmbed.addFields([{ name: '**MOTD:**', value: pong.motd.clean.join('\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '≤').replace(/&ge;/g, '≥') }]);
			if (pong.plugins && pong.plugins.raw[0]) {
				const link = await createPaste(pong.plugins.raw.join('\n'), { server: 'https://bin.birdflop.com' });
				StatsEmbed.addFields([{ name: '**Plugins:**', value: `[Click Here](${link})`, inline: true }]);
			}
			if (!pong.debug.query) StatsEmbed.setFooter('Query disabled! If you want more info, contact the owner to enable query.');
			message.reply({ embeds: [StatsEmbed], files: iconpng });
		}
		catch (err) { client.error(err, message); }
	},
};