module.exports = async (client, oldState, newState) => {
	// get guild and player
	const guildId = newState.guild.id;
	const player = client.manager.get(guildId);

	// check if the bot is active (playing, paused or empty does not matter (return otherwise)
	if (!player || player.state !== 'CONNECTED') return;

	const stateChange = {};

	if (oldState.channel === null && newState.channel !== null) stateChange.type = 'JOIN';
	if (oldState.channel !== null && newState.channel === null) stateChange.type = 'LEAVE';
	if (oldState.channel !== null && newState.channel !== null) stateChange.type = 'MOVE';
	if (oldState.channel === null && newState.channel === null) return;
	if (newState.serverMute == true && oldState.serverMute == false && oldState.id == client.user.id) {
		client.logger.info(`Paused player in ${newState.guild.name} because of server mute`);
		return player.pause(true);
	}
	if (newState.serverMute == false && oldState.serverMute == true && oldState.id == client.user.id) {
		client.logger.info(`Resumed player in ${newState.guild.name} because of server unmute`);
		return player.pause(false);
	}

	// move check first as it changes type
	if (stateChange.type === 'MOVE') {
		if (oldState.channel.id === player.voiceChannel) stateChange.type = 'LEAVE';
		if (newState.channel.id === player.voiceChannel) stateChange.type = 'JOIN';
	}
	// double triggered on purpose for MOVE events
	if (stateChange.type === 'JOIN') stateChange.channel = newState.channel;
	if (stateChange.type === 'LEAVE') stateChange.channel = oldState.channel;

	// check if the bot's voice channel is involved (return otherwise)
	if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel) return;

	// filter current users based on being a bot
	stateChange.members = stateChange.channel.members.filter(member => !member.user.bot);

	let deafened = true;
	stateChange.members.forEach(member => { if (!member.voice.selfDeaf) deafened = false; });

	if (deafened) {
		player.pause(true);
		client.logger.info(`Paused player in ${newState.guild.name} because of user deafen`);
		player.timeout = Date.now() + 300000;
		client.logger.info(`Timeout set to ${player.timeout}`);
	}
	else if (player.paused) {
		player.pause(false);
		client.logger.info(`Resumed player in ${newState.guild.name} because of user undeafen`);
		player.timeout = null;
		client.logger.info(`Timeout set to ${player.timeout}`);
	}

	switch (stateChange.type) {
	case 'JOIN':
		if (stateChange.members.size === 1 && player.paused) {
			player.pause(false);
			client.logger.info(`Resumed player in ${newState.guild.name} because of user join`);
			player.timeout = null;
			client.logger.info(`Timeout set to ${player.timeout}`);
		}
		break;
	case 'LEAVE':
		if (stateChange.members.size === 0) {
			if (!player.paused) {
				player.pause(true);
				client.logger.info(`Paused player in ${newState.guild.name} because of empty channel`);
			}
			player.timeout = Date.now() + 300000;
			client.logger.info(`Timeout set to ${player.timeout}`);
		}
		break;
	}
};