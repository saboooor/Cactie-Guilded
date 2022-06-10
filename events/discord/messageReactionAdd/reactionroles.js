function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
module.exports = async (client, reaction, user) => {
	if (user.bot) return;
	const message = await reaction.message.fetch().catch(err => client.logger.error(err.stack));
	if (!message.channel || message.channel.isDMBased()) return;
	let emojiId = reaction.emoji.id;
	if (!emojiId) emojiId = reaction.emoji.name;

	const reactionrole = (await client.query(`SELECT * FROM reactionroles WHERE messageId = '${message.id}' AND emojiId = '${emojiId}'`))[0];
	if (reactionrole) {
		const role = message.guild.roles.cache.get(reactionrole.roleId);
		if (!role) return client.error('The role can\'t be found!', message, true);
		let member = await message.guild.members.cache.get(user.id);
		if (!member) member = await message.guild.members.fetch(user.id);
		let msg;
		if (reactionrole.type == 'toggle') {
			reaction.users.remove(user.id);
			if (!member.roles.cache.has(role.id)) {
				await member.roles.add(role);
				msg = await message.channel.send({ content: `✅ **Added ${role.name} Role to ${user}**` });
				client.logger.info(`Added ${role.name} Role to ${user.tag} in ${message.guild.name}`);
			}
			else {
				await member.roles.remove(role);
				msg = await message.channel.send({ content: `❌ **Removed ${role.name} Role from ${user}**` });
				client.logger.info(`Removed ${role.name} Role from ${user.tag} in ${message.guild.name}`);
			}
		}
		else {
			await member.roles.add(role);
			msg = await message.channel.send({ content: `✅ **Added ${role.name} Role to ${user}**` });
			client.logger.info(`Added ${role.name} Role to ${user.tag} in ${message.guild.name}`);
		}
		await sleep(1000);
		await msg.delete().catch(err => client.logger.error(err.stack));
	}
};