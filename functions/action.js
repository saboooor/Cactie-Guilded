const { Embed } = require('guilded.js');
const gifs = require('../lang/int/actiongifs.json');
let current;
module.exports = async function action(message, author, args, type, lang) {
	// Get random index of gif list
	let i = Math.floor(Math.random() * gifs[type].length);

	// If index is the same as the last one, get a new one
	if (i === current) {
		do i = Math.floor(Math.random() * gifs[type].length);
		while (i === current);
		current = i;
	}

	// Get the username and iconURL
	const username = author.user.name;
	const iconURL = author.user.avatar;

	// Create embed with bonk gif and author / footer
	const BonkEmbed = new Embed()
		.setAuthor(`${username} ${lang.actions[type].plural} ${args[0] ? args.join(' ') : ''}`, iconURL)
		.setImage(gifs[type][i])
		.setFooter(lang.actions[type].footer);

	// Reply with bonk message, if user is set then mention the user
	if (message.member.id == message.client.user.id) {
		message.delete();
		message.channel.send({ embeds: [BonkEmbed] });
		return;
	}
	else { message.reply({ embeds: [BonkEmbed] }); }
};