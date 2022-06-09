const { EmbedBuilder } = require('discord.js');
module.exports = {
	name: 'effect',
	description: 'Add various effects to the music (EXPERIMENTAL)',
	usage: '<Cry/Echo/Pan/Timescale/Tremolo/Underwater> <Arguments>',
	args: true,
	voteOnly: true,
	player: true,
	playing: true,
	options: require('../../options/effect.js'),
	async execute(message, args, client) {
		try {
			// Create embed
			const filterEmbed = new EmbedBuilder()
				.setColor(0x2f3136)
				.setTitle('Music effect set!');

			// Get player
			const player = client.manager.get(message.guild.id);

			// Get the type
			const type = args[0].toLowerCase();
			if (type == 'cry') {
				// Check if frequency is between 0 and 14 and depth between 0 and 1
				if (args[1] && (args[1] <= 0 || args[1] > 14)) return message.reply('The frequency must be between 0 and 14!');
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply('The depth must be between 0 and 100!');

				// Set effects
				player.effects = {
					...player.effects,
					vibrato: {
						frequency: Number(args[1]) ?? 14,
						depth: Number(args[2] / 100) ?? 1,
					},
				};
			}
			else if (type == 'echo') {
				// Check if delay is over 0 and decay is between 0 and 1
				if (args[1] && args[1] <= 0) return message.reply('The delay must be higher than 0!');
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply('The decay must be between 0 and 100!');

				// Set effects
				player.effects = {
					...player.effects,
					echo: {
						delay: Number(args[1]) ?? 0.5,
						decay: Number(args[2] / 100) ?? 0.2,
					},
				};
			}
			else if (type == 'pan') {
				// Set effects
				player.effects = {
					...player.effects,
					rotation: {
						rotationHz: Number(args[1]) ?? 1,
					},
				};
			}
			else if (type == 'timescale') {
				// Check if speed or pitch is more than 0
				if (args[1] <= 0) return message.reply('The speed must be more than 0! (Default: 1)');
				if (args[2] <= 0) return message.reply('The pitch must be more than 0! (Default: 1)');

				// Set effects
				player.effects = {
					...player.effects,
					timescale: {
						speed: Number(args[1]),
						pitch: Number(args[2]),
					},
				};
			}
			else if (type == 'tremolo') {
				// Check if frequency is between 0 and 14 and depth between 0 and 1
				if (args[1] && args[1] <= 0) return message.reply('The frequency must be higher than 0!');
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply('The must be between 0 and 100!');

				// Set effects
				player.effects = {
					...player.effects,
					tremolo: {
						frequency: Number(args[1]) ?? 14,
						depth: Number(args[2] / 100) ?? 1,
					},
				};
			}
			else if (type == 'underwater') {
				// Set effects
				player.effects = {
					...player.effects,
					karaoke: {
						level: 1.0,
						monoLevel: 1.0,
						filterBand: 220.0,
						filterWidth: 100.0,
					},
				};
			}
			else {
				// Return error if type is invalid
				return message.reply('**You must specify a valid effect type!**\nHere\'s a list of the effects:\n```\ncry [Frequency in Hz] [Depth in %]\necho [Delay in seconds] [Decay in %]\npan [Rotation in Hz]\ntimescale <Speed in x> <Pitch in x>\ntremolo [Frequency in Hz] [Depth in %]\nunderwater\n```');
			}

			// Send player effects to node
			await player.node.send({
				op: 'filters',
				guildId: player.guild,
				...player.effects,
			});

			// Set fields according to effects
			Object.keys(player.effects).forEach(effect => {
				const field = { name: effect };
				if (effect == 'vibrato') field.value = `${player.effects.vibrato.frequency} Hz, ${player.effects.vibrato.depth * 100}%`;
				else if (effect == 'echo') field.value = `${player.effects.echo.delay}s, ${player.effects.echo.decay * 100}%`;
				else if (effect == 'pan') field.value = `${player.effects.rotation.rotationHz} Hz`;
				else if (effect == 'timescale') field.value = `${player.effects.timescale.speed}x, ${player.effects.timescale.pitch}x`;
				else if (effect == 'tremolo') field.value = `${player.effects.tremolo.frequency} Hz, ${player.effects.tremolo.depth * 100}%`;
				else if (effect == 'karaoke') field.value = 'Underwater';
				filterEmbed.addFields([field]);
			});

			// Respond
			message.reply({ embeds: [filterEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};