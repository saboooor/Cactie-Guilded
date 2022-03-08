const desc = require('../lang/en/settingsdesc.json');
module.exports = {
	name: 'settings_next',
	async execute(interaction, client) {
		try {
			// Get list of settings and embed
			const settings = await client.getData('settings', 'guildId', interaction.guild.id);
			const srvconfig = Object.keys(settings).map(prop => {
				return `**${prop}**\n${desc[prop]}\n\`${settings[prop]}\``;
			});
			const SettingEmbed = interaction.message.embeds[0];

			// Calculate total amount of pages and get current page from embed footer
			const maxPages = Math.ceil(srvconfig.length / 5);
			const lastPage = parseInt(SettingEmbed.footer ? SettingEmbed.footer.text.split(' ')[1] : maxPages);

			// Get next page (if last page, go to pg 1)
			const page = lastPage + 1 == maxPages + 1 ? 1 : lastPage + 1;
			const end = page * 5;
			const start = end - 5;

			// Update embed description with new page and reply
			SettingEmbed.setDescription(srvconfig.slice(start, end).join('\n'))
				.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });
			interaction.reply({ embeds: [SettingEmbed], components: interaction.message.components });
		}
		catch (err) { client.error(err, interaction); }
	},
};