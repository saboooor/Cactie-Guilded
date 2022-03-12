const { Embed, ActionRow, ButtonComponent, ButtonStyle } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: e }) => e(...args));
const { left, right } = require('../../lang/int/emoji.json');
const msg = require('../../lang/en/msg.json');
const YAML = require('yaml');
const fs = require('fs');
const createField = require('./createField.js');
const evalField = require('./evalField.js');
module.exports = async function analyzeTimings(message, client, args) {
	const TimingsEmbed = new Embed()
		.setDescription('These are not magic values. Many of these settings have real consequences on your server\'s mechanics. See [this guide](https://eternity.community/index.php/paper-optimization/) for detailed information on the functionality of each setting.')
		.setFooter({ text: `Requested by ${message.member.user.tag}`, iconURL: message.member.user.avatarURL() });

	let url = null;

	args.forEach(arg => {
		if (arg.startsWith('https://timin') && arg.includes('?id=')) url = arg.replace('/d=', '/?id=').split('#')[0].split('\n')[0];
		if (arg.startsWith('https://www.spigotmc.org/go/timings?url=') || arg.startsWith('https://spigotmc.org/go/timings?url=')) {
			TimingsEmbed.addFields({ name: '❌ Spigot', value: 'Spigot timings have limited information. Switch to [Purpur](https://purpurmc.org) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.' })
				.setURL(url);
			return [{ embeds: [TimingsEmbed] }];
		}
	});

	if (!url) return [{ content: 'Invalid URL' }];

	client.logger.info(`Timings analyzed from ${message.member.user.tag} (${message.member.user.id}): ${url}`);

	const timings_host = url.split('?id=')[0];
	const timings_id = url.split('?id=')[1];

	const timings_json = timings_host + 'data.php?id=' + timings_id;
	const url_raw = url + '&raw=1';

	const response_raw = await fetch(url_raw);
	const request_raw = await response_raw.json();
	const response_json = await fetch(timings_json);
	const request = await response_json.json();

	const server_icon = timings_host + 'image.php?id=' + request_raw.icon;
	TimingsEmbed.setAuthor({ name: 'Timings Analysis', iconURL: server_icon, url: url });

	if (!request_raw || !request) {
		TimingsEmbed.addFields({ name: '❌ Invalid report', value: 'Create a new timings report.', inline: true });
		return [{ embeds: [TimingsEmbed] }];
	}

	let version = request.timingsMaster.version;
	client.logger.info(version);

	if (version.endsWith('(MC: 1.17)')) version = version.replace('(MC: 1.17)', '(MC: 1.17.0)');

	const TIMINGS_CHECK = await YAML.parse(fs.readFileSync('./lang/int/timings_check.yml', 'utf8'));

	if (TIMINGS_CHECK.version && version) {
		// ghetto version check
		if (version.split('(MC: ')[1].split(')')[0] != TIMINGS_CHECK.version) {
			version = version.replace('git-', '').replace('MC: ', '');
			TimingsEmbed.addFields({ name: '❌ Outdated', value: `You are using \`${version}\`. Update to \`${TIMINGS_CHECK.version}\`.`, inline: true });
		}
	}

	if (TIMINGS_CHECK.servers) {
		TIMINGS_CHECK.servers.forEach(server => {
			if (version.includes(server.name)) TimingsEmbed.addFields(createField(server));
		});
	}

	const timing_cost = parseInt(request.timingsMaster.system.timingcost);
	if (timing_cost > 300) TimingsEmbed.addFields({ name: '❌ Timingcost', value: `Your timingcost is ${timing_cost}. Your cpu is overloaded and/or slow. Find a [better host](https://www.birdflop.com).`, inline: true });

	const flags = request.timingsMaster.system.flags;
	const jvm_version = request.timingsMaster.system.jvmversion;
	if (flags.includes('-XX:+UseZGC') && flags.includes('-Xmx')) {
		const flaglist = flags.split(' ');
		flaglist.forEach(flag => {
			if (flag.startsWith('-Xmx')) {
				let max_mem = flag.split('-Xmx')[1];
				max_mem = max_mem.replace('G', '000');
				max_mem = max_mem.replace('M', '');
				max_mem = max_mem.replace('g', '000');
				max_mem = max_mem.replace('m', '');
				if (parseInt(max_mem) < 10000) TimingsEmbed.addFields({ name: '❌ Low Memory', value:'ZGC is only good with a lot of memory.', inline: true });
			}
		});
	}
	else if (flags.includes('-Daikars.new.flags=true')) {
		if (!flags.includes('-XX:+PerfDisableSharedMem')) TimingsEmbed.addFields({ name: '❌ Outdated Flags', value: 'Add `-XX:+PerfDisableSharedMem` to flags.', inline: true });
		if (!flags.includes('-XX:G1MixedGCCountTarget=4')) TimingsEmbed.addFields({ name: '❌ Outdated Flags', value: 'Add `XX:G1MixedGCCountTarget=4` to flags.', inline: true });
		if (!flags.includes('-XX:+UseG1GC') && jvm_version.startswith('1.8.')) TimingsEmbed.addFields({ name: '❌ Aikar\'s Flags', value: 'You must use G1GC when using Aikar\'s flags.', inline: true });
		if (flags.includes('-Xmx')) {
			let max_mem = 0;
			const flaglist = flags.split(' ');
			flaglist.forEach(flag => {
				if (flag.startsWith('-Xmx')) {
					max_mem = flag.split('-Xmx')[1];
					max_mem = max_mem.replace('G', '000');
					max_mem = max_mem.replace('M', '');
					max_mem = max_mem.replace('g', '000');
					max_mem = max_mem.replace('m', '');
				}
			});
			if (parseInt(max_mem) < 5400) TimingsEmbed.addFields({ name: '❌ Low Memory', value: 'Allocate at least 6-10GB of ram to your server if you can afford it.', inline: true });
			let index = 0;
			let max_online_players = 0;
			while (index < request.timingsMaster.data.length) {
				const timed_ticks = request.timingsMaster.data[index].minuteReports[0].ticks.timedTicks;
				const player_ticks = request.timingsMaster.data[index].minuteReports[0].ticks.playerTicks;
				const players = (player_ticks / timed_ticks);
				max_online_players = Math.max(players, max_online_players);
				index = index + 1;
			}
			if (1000 * max_online_players / parseInt(max_mem) > 6 && parseInt(max_mem) < 10000) TimingsEmbed.addFields({ name: '❌ Low Memory', value: 'You should be using more RAM with this many players.', inline: true });
			if (flags.includes('-Xms')) {
				let min_mem = 0;
				flaglist.forEach(flag => {
					if (flag.startsWith('-Xmx')) {
						min_mem = flag.split('-Xmx')[1];
						min_mem = min_mem.replace('G', '000');
						min_mem = min_mem.replace('M', '');
						min_mem = min_mem.replace('g', '000');
						min_mem = min_mem.replace('m', '');
					}
				});
				if (min_mem != max_mem) TimingsEmbed.addFields({ name: '❌ Aikar\'s Flags', value: 'Your Xmx and Xms values should be equal when using Aikar\'s flags.', inline: true });
			}
		}
	}
	else if (flags.includes('-Dusing.aikars.flags=mcflags.emc.gs')) {
		TimingsEmbed.addFields({ name: '❌ Outdated Flags', value: 'Update [Aikar\'s flags](https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/).', inline: true });
	}
	else {
		TimingsEmbed.addFields({ name: '❌ Aikar\'s Flags', value: 'Use [Aikar\'s flags](https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/).', inline: true });
	}

	const cpu = parseInt(request.timingsMaster.system.cpu);
	if (cpu <= 2) TimingsEmbed.addFields({ name: '❌ Threads', value: `You only have ${cpu} thread(s). Find a [better host](https://www.birdflop.com).`, inline: true });

	const handlers = Object.keys(request_raw.idmap.handlers).map(i => { return request_raw.idmap.handlers[i]; });
	handlers.forEach(handler => {
		let handler_name = handler[1];
		if (handler_name.startsWith('Command Function - ') && handler_name.endsWith(':tick')) {
			handler_name = handler_name.split('Command Function - ')[1].split(':tick')[0];
			TimingsEmbed.addFields({ name: `❌ ${handler_name}`, value: 'This datapack uses command functions which are laggy.', inline: true });
		}
	});

	const plugins = Object.keys(request.timingsMaster.plugins).map(i => { return request.timingsMaster.plugins[i]; });
	const server_properties = request.timingsMaster.config['server.properties'];
	const bukkit = request.timingsMaster.config ? request.timingsMaster.config.bukkit : null;
	const spigot = request.timingsMaster.config ? request.timingsMaster.config.spigot : null;
	const paper = request.timingsMaster.config ? request.timingsMaster.config.paper : null;
	const purpur = request.timingsMaster.config ? request.timingsMaster.config.purpur : null;

	if (TIMINGS_CHECK.plugins) {
		Object.keys(TIMINGS_CHECK.plugins).forEach(server_name => {
			if (Object.keys(request.timingsMaster.config).includes(server_name)) {
				plugins.forEach(plugin => {
					Object.keys(TIMINGS_CHECK.plugins[server_name]).forEach(plugin_name => {
						if (plugin.name == plugin_name) {
							const stored_plugin = TIMINGS_CHECK.plugins[server_name][plugin_name];
							stored_plugin.name = plugin_name;
							TimingsEmbed.addFields(createField(stored_plugin));
						}
					});
				});
			}
		});
	}
	if (TIMINGS_CHECK.config) {
		Object.keys(TIMINGS_CHECK.config).map(i => { return TIMINGS_CHECK.config[i]; }).forEach(config => {
			Object.keys(config).forEach(option_name => {
				const option = config[option_name];
				evalField(TimingsEmbed, option, option_name, plugins, server_properties, bukkit, spigot, paper, purpur, client);
			});
		});
	}

	plugins.forEach(plugin => {
		if (plugin.authors && plugin.authors.toLowerCase().includes('songoda')) {
			if (plugin.name == 'EpicHeads') TimingsEmbed.addFields({ name: '❌ EpicHeads', value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative such as [HeadsPlus](https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/) or [HeadDatabase](https://www.spigotmc.org/resources/head-database.14280/).', inline: true });
			else if (plugin.name == 'UltimateStacker') TimingsEmbed.addFields({ name: '❌ UltimateStacker', value: 'Stacking plugins actually causes more lag.\nRemove UltimateStacker.', inline: true });
			else TimingsEmbed.addFields({ name: `❌ ${plugin.name}`, value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.', inline: true });
		}
	});

	const worlds = request_raw.worlds ? Object.keys(request_raw.worlds).map(i => { return request_raw.worlds[i]; }) : [];
	let high_mec = false;
	worlds.forEach(world => {
		const max_entity_cramming = parseInt(world.gamerules.maxEntityCramming);
		if (max_entity_cramming >= 24) high_mec = true;
	});
	if (high_mec) TimingsEmbed.addFields({ name: '❌ maxEntityCramming', value: 'Decrease this by running the /gamerule command in each world. Recommended: 8.', inline: true });

	const normal_ticks = request.timingsMaster.data[0].totalTicks;
	let worst_tps = 20;
	request.timingsMaster.data.forEach(data => {
		const total_ticks = data.totalTicks;
		if (total_ticks == normal_ticks) {
			const end_time = data.end;
			const start_time = data.start;
			let tps = null;
			if (end_time == start_time) tps = 20;
			else tps = total_ticks / (end_time - start_time);
			if (tps < worst_tps) worst_tps = tps;
		}
	});
	let red = 0;
	let green = 0;
	if (worst_tps < 10) {
		red = 255;
		green = 255 * (0.1 * worst_tps);
	}
	else {
		red = 255 * (-0.1 * worst_tps + 2);
		green = 255;
	}

	function componentToHex(c) {
		const hex = c.toString(16);
		return hex.length == 1 ? '0' + hex : hex;
	}
	TimingsEmbed.setColor(parseInt('0x' + componentToHex(Math.round(red)) + componentToHex(Math.round(green)) + '00'));

	const issues = TimingsEmbed.fields;
	if (issues.length == 0) {
		TimingsEmbed.addFields({ name: '✅ All good', value: 'Analyzed with no recommendations.' });
		return [{ embeds: [TimingsEmbed] }];
	}
	const components = [];
	if (issues.length >= 13) {
		TimingsEmbed.fields.splice(12, issues.length);
		TimingsEmbed.addFields({ name: `Plus ${issues.length - 12} more recommendations`, value: 'Click the buttons below to see more' });
		TimingsEmbed.setFooter({ text: `Requested by ${message.member.user.tag} • ${msg.page.replace('-1', '1').replace('-2', Math.ceil(issues.length / 12))}`, iconURL: message.member.user.avatarURL() });
		components.push(
			new ActionRow()
				.addComponents(
					new ButtonComponent()
						.setCustomId('timings_prev')
						.setEmoji({ id: left })
						.setStyle(ButtonStyle.Secondary),
					new ButtonComponent()
						.setCustomId('timings_next')
						.setEmoji({ id: right })
						.setStyle(ButtonStyle.Secondary),
					new ButtonComponent()
						.setURL('https://github.com/pemigrade/botflop')
						.setLabel('Botflop')
						.setStyle(ButtonStyle.Link),
				),
		);
	}
	return [{ embeds: [TimingsEmbed], components: components }, issues];
};