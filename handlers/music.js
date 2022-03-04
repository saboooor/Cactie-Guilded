const { Manager, Structure } = require('erela.js');
const { LavasfyClient } = require('lavasfy');
const compressEmbed = require('../functions/compressEmbed.js');
const { nodes, SpotifyID, SpotifySecret } = require('../config/music.json');
const fs = require('fs');
const { refresh } = require('../lang/int/emoji.json');
const { ActionRow, ButtonComponent, ButtonStyle } = require('discord.js');
const queuerow = new ActionRow()
	.addComponents(
		new ButtonComponent()
			.setCustomId('music_playnext')
			.setEmoji({ id: refresh })
			.setLabel('Replay Next')
			.setStyle(ButtonStyle.Secondary),
		new ButtonComponent()
			.setCustomId('music_playlast')
			.setEmoji({ id: refresh })
			.setLabel('Re-add to queue')
			.setStyle(ButtonStyle.Secondary),
	);
module.exports = client => {
	Structure.extend(
		'Player',
		(Player) =>
			class extends Player {
				setNowplayingMessage(message) {
					const NPEmbed = this.nowPlayingMessage.embeds[0];
					const row = NPEmbed.description.startsWith('<:play:948091865977196554> **Started Playing**') ? queuerow : null;
					if (this.nowPlayingMessage) this.nowPlayingMessage.edit({ embeds: [compressEmbed(NPEmbed)], components: [row] }).catch(err => client.logger.error(err));
					return this.nowPlayingMessage = message;
				}
			},
	);
	nodes.forEach(node => node.id = node.identifier);
	client.Lavasfy = new LavasfyClient(
		{
			clientID: SpotifyID,
			clientSecret: SpotifySecret,
			playlistPageLoadLimit: 4,
			filterAudioOnlyResult: true,
			autoResolve: true,
			useSpotifyMetadata: true,
		},
		nodes,
	);
	client.manager = new Manager({
		nodes: nodes,
		send: (id, payload) => {
			const guild = client.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
		autoPlay: true,
	});
	client.on('raw', (d) => client.manager.updateVoiceState(d));
	fs.readdir('./events/music/', (err, files) => {
		if (err) return client.logger.error(err);
		// go through all the files in the events/music folder and register them
		let amount = 0;
		files.forEach(file => {
			if (!file.endsWith('.js')) return;
			const event = require(`../events/music/${file}`);
			const eventName = file.split('.')[0];
			client.manager.on(eventName, event.bind(null, client));
			amount = amount + 1;
		});
		client.logger.info(`${amount} lavalink event listeners loaded`);
	});
	client.logger.info('Music handler loaded');
};