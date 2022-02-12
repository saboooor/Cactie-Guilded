const { Embed } = require('discord.js');
module.exports = {
	name: 'unban',
	description: 'Unban someone that was banned from the server',
	ephemeral: true,
	args: true,
	usage: '<User>',
	permission: 'BAN_MEMBERS',
	botperm: 'BAN_MEMBERS',
	cooldown: 5,
	options: require('../options/user.json'),
	async execute(message, args, client) {
		try {
			// Get user from arg and check if user is valid
			const user = client.users.cache.get(args[0].replace(/\D/g, ''));
			if (!user) return message.reply({ content: 'Invalid User!' });

			// Send unban message to user
			await user.send({ content: `**You've been unbanned in ${message.guild.name}**` })
				.catch(e => {
					client.logger.warn(e);
					message.reply({ content: 'Could not DM user! You may have to manually let them know that they have been unbanned.' });
				});

			// Actually unban the dude
			message.guild.members.unban(user.id);

			// Create embed with color and title
			const UnbanEmbed = new Embed()
				.setColor(Math.round(Math.random() * 16777215))
				.setTitle(`Unbanned ${user.tag}`);

			// Reply with unban log
			message.reply({ embeds: [UnbanEmbed] });
			client.logger.info(`Unbanned user: ${user.tag} in ${message.guild.name}`);

			// Check if log channel exists and send message
			const srvconfig = await client.getData('settings', 'guildId', message.guild.id);
			const logchannel = message.guild.channels.cache.get(srvconfig.logchannel);
			if (logchannel) {
				UnbanEmbed.setTitle(`${message.member.user.tag} ${UnbanEmbed.title}`);
				logchannel.send({ embeds: [UnbanEmbed] });
			}
		}
		catch (err) {
			client.error(err, message);
		}
	},
};