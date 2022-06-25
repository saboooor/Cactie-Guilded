const { EmbedBuilder } = require('discord.js');
module.exports = async (client, oldState, newState) => {
	// Check if the user actually left
	if (newState.channelId != null || oldState.channelId == null) return;

	// Get current settings for the guild
	const srvconfig = await client.getData('settings', 'guildId', newState.guild.id);

	// Check if log is enabled and send log
	if (['voiceleave', 'voice', 'other', 'all'].some(logtype => srvconfig.auditlogs.split(',').includes(logtype))) {
		const logchannel = newState.guild.channels.cache.get(srvconfig.logchannel);
		if (!logchannel) return;
		const logEmbed = new EmbedBuilder()
			.setColor(0x2f3136)
			.setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.avatarURL() })
			.setTitle('Member left voice channel')
			.setFields([
				{ name: 'Member', value: `${newState.member}`, inline: true },
				{ name: 'Channel', value: `${oldState.channel}`, inline: true },
			]);
		logchannel.send({ embeds: [logEmbed] }).catch(err => client.logger.error(err));
	}
};