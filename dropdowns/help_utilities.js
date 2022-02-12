const { Embed } = require('discord.js');
module.exports = {
	name: 'help_utilities',
	async execute(interaction, client) {
		try {
			const srvconfig = await client.getData('settings', 'guildId', interaction.guild.id);
			const prefix = srvconfig.prefix.replace(/([^\\]|^|\*|_|`|~)(\*|_|`|~)/g, '$1\\$2');
			const Embed = new Embed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle('**HELP**');
			require('../help/utilities.js')(prefix, Embed);
			interaction.message.components[0].components[0].options.forEach(option => option.default = false);
			interaction.message.components[0].components[0].options[5].default = true;
			interaction.reply({ embeds: [Embed], components: interaction.message.components });
		}
		catch (err) {
			client.error(err, interaction);
		}
},
};