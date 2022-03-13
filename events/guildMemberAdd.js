module.exports = async (client, member) => {
	const srvconfig = await client.getData('settings', 'guildId', member.guild.id);
	if (srvconfig.joinmessage == 'false') return;
	if (!member.guild.systemChannel) {
		const owner = await member.guild.fetchOwner();
		client.logger.warn(`${member.guild.name} (${owner.tag}) has misconfigured join messages!`);
		return owner.send({ content: `Join messages are enabled but a system message channel isn't set! Please either go into your server settings (${member.guild.name}) and set the system message channel or turn off join messages with the command \`/settings joinmessage false\`` })
			.catch(err => client.logger.warn(err));
	}
	const muterole = member.guild.roles.cache.get(srvconfig.mutecmd);
	const memberdata = await client.query(`SELECT * FROM memberdata WHERE memberId = '${member.id}-${member.guild.id}'`);
	if (memberdata[0] && memberdata[0].mutedUntil != 0 && muterole) member.roles.add(muterole);
	member.guild.systemChannel.send({ content: srvconfig.joinmessage.replace(/{USER MENTION}/g, `${member}`).replace(/{USER TAG}/g, member.user.tag) });
};