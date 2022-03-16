module.exports = {
	name: 'reload',
	description: 'Reloads a Cactie interaction',
	args: true,
	async execute(message, args, client) {
		try {
			// Check if user is sab lolololol
			if (message.author.id !== '249638347306303499') return client.error('You can\'t do that!', message, true);
			const interaction = args[0].toLowerCase();
			const category = args[1].toLowerCase();
			const commandName = interaction == 'commands' ? args[2].toLowerCase() : category;
			const command = client[interaction].get(commandName) || client[interaction].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) return message.reply(`There is no command with name or alias \`${commandName}\`!`);

			delete require.cache[require.resolve(`../../${interaction}${interaction == 'commands' ? `/${category}` : ''}/${command.name}.js`)];

			const newCommand = require(`../../${interaction}${interaction == 'commands' ? `/${category}` : ''}/${command.name}.js`);
			client[interaction].set(newCommand.name, newCommand);
			message.reply(`${interaction} \`${command.name}\` was reloaded!`);
		}
		catch (err) { client.error(err, message); }
	},
};