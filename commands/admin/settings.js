const { Embed } = require('guilded.js');

module.exports = {
	name: 'settings',
	description: 'Configure Cactie\'s settings in the server',
	aliases: ['setting'],
	usage: '[Option]',
	noDefer: true,
	permission: 'Administrator',
	async execute(message, args, client, lang) {
		try {
			// Get the settings descriptions
			const desc = require(`../../lang/${lang.language.name}/settingsdesc.json`);

			// Create Embed with title and color
			const SettingsEmbed = new Embed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle('Bot Settings');

			// Get settings and make an array out of it to split and make pages
			const srvconfig = await client.getData('guildedSettings', 'guildId', message.serverId);
			const configlist = Object.keys(srvconfig).map(prop => { return `**${prop}**\n${desc[prop]}\n\`${srvconfig[prop]}\``; });

			// Set embed description with page and stuff
			SettingsEmbed.setDescription(configlist.join('\n'))
				.addFields([
					{ name: 'Usage', value: `\`${srvconfig.prefix}settings <setting> <value>\`` },
					{ name: lang.dashboard.confusing, value: `[${lang.dashboard.use}](https://cactiedev.smhsmh.club/dashboard/guilded/${message.serverId})\nCurrently there is no OAuth2 integration on the dashboard, so this doesn't work yet.` },
				]);

			if (args[0]) {
				const prop = args.shift().toLowerCase();
				const value = args.join(' ');

				if (!srvconfig[prop]) return client.error(`'${prop}' is an invalid setting!`, message, true);

				if (prop == 'maxppsize' && (isNaN(value) || value > 75)) return client.error(`'${prop}' must be a valid number that is under 75!`, message, true);
				if (prop == 'logchannel' && value != 'false' && !(await client.channels.fetch(prop))) return client.error(`'${prop}' must be a valid channel Id!`, message, true);
				if (prop == 'reactions' && value != 'false' && value != 'true') return client.error(`'${prop}' must be either \`true\` or \`false\`!`, message, true);

				await client.setData('guildedSettings', 'guildId', srvconfig.guildId, prop, value);
				SettingsEmbed.setDescription(`Successfully set \`${prop}\` to \`${value}\``).clearFields();
			}

			await message.reply({ embeds: [SettingsEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};