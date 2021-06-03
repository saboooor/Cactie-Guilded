const Discord = require('discord.js');
module.exports = {
	name: 'ping',
	description: 'Pong!',
	aliases: ['pong'],
	cooldown: 2,
	execute(message, args, client) {
		const row = new Discord.MessageActionRow()
			.addComponents(new Discord.MessageButton()
				.setCustomID('ping_again')
				.setLabel('Click here to ping again!')
				.setStyle('PRIMARY'));
		const Embed = new Discord.MessageEmbed()
			.setColor(Math.floor(Math.random() * 16777215))
			.setTitle('Pong!')
			.setDescription(`${Date.now() - message.createdTimestamp}ms`);
		if (message.commandName) message.reply({ embeds: [Embed], components: [row], ephemeral: true });
		else message.reply({ embed: Embed, components: [row] });
	},
};