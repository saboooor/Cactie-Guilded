const { Embed, ActionRow, ButtonComponent, ButtonStyle } = require('discord.js');
module.exports = client => {
	client.error = function error(err, message, userError) {
		client.logger.error(err);
		const errEmbed = new Embed()
			.setColor(0xE74C3C)
			.setTitle('Error')
			.setURL(`https://panel.netherdepths.com/server/41769d86/files/edit#/logs/${client.date}.log`)
			.setDescription(`\`\`\`\n${err}\n\`\`\``);
		const row = [];
		if (!userError) {
			errEmbed.setFooter({ text: 'This was most likely an error on our end. Please report this at the Pup Support Discord Server!' });
			row.push(new ActionRow()
				.addComponents(
					new ButtonComponent()
						.setURL('https://pup.smhsmh.club/discord')
						.setLabel('Support Server')
						.setStyle(ButtonStyle.Link),
				));
		}
		message.channel.send({ embeds: [errEmbed], components: [row] });
	};
	client.logger.info('Error Handler Loaded');
};