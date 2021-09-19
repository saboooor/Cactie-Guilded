const { MessageEmbed } = require('discord.js');
const { loop } = require('../../config/emoji.json');
module.exports = {
	name: 'loop',
	description: 'Toggle music loop',
	aliases: ['l'],
	guildOnly: true,
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	async execute(message, args) {
		const player = message.client.manager.get(message.guild.id);
		if (!player.queue.current) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription('There is no music playing.');
			return message.reply({ embeds: [thing] });
		}
		if (args.length && /queue/i.test(args[0])) {
			player.setQueueRepeat(!player.queueRepeat);
			const queueRepeat = player.queueRepeat ? 'enabled' : 'disabled';
			const thing = new MessageEmbed()
				.setColor(Math.round(Math.random() * 16777215))
				.setTimestamp()
				.setDescription(`${loop} Loop queue is now **${queueRepeat}**`);
			return message.reply({ embeds: [thing] });
		}
		player.setTrackRepeat(!player.trackRepeat);
		const trackRepeat = player.trackRepeat ? 'enabled' : 'disabled';
		const thing = new MessageEmbed()
			.setColor(Math.round(Math.random() * 16777215))
			.setTimestamp()
			.setDescription(`${loop} Loop track is now **${trackRepeat}**`);
		return message.reply({ embeds: [thing] });
	},
};