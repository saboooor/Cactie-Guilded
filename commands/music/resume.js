const { MessageEmbed } = require('discord.js');
const { resume } = require('../../config/emoji.json');
const { getColor } = require('colorthief');
const rgb2hex = require('../../functions/rgbhex');
module.exports = {
	name: 'resume',
	description: 'Resume currently playing music',
	aliases: ['r'],
	guildOnly: true,
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	djRole: true,
	async execute(message, args, client) {
		const player = client.manager.get(message.guild.id);
		const song = player.queue.current;
		if (!player.paused) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription(`${resume} The player is already **resumed**.`)
				.setTimestamp();
			return message.reply({ embeds: [thing] });
		}
		player.pause(false);
		if (!song.color) song.color = rgb2hex(await getColor(song.img));
		const thing = new MessageEmbed()
			.setDescription(`${resume} **Resumed**\n[${song.title}](${song.uri})`)
			.setColor(song.color)
			.setTimestamp()
			.setThumbnail(song.img);
		return message.reply({ embeds: [thing] });
	},
};