module.exports = {
	name: 'reload',
	description: 'Reloads a Cactie interaction',
	args: true,
	async execute(message, args, client) {
		try {
			// Check if user is sab lolololol
			if (message.createdById !== 'AYzRpEe4') return client.error('You can\'t do that!', message, true);
			const category = args[0].toLowerCase();
			const commandName = args[1].toLowerCase();
			const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) return client.error(`There is no command with name or alias \`${commandName}\`!`, message, true);

			delete require.cache[require.resolve(`../../commands/${category}/${command.name}.js`)];

			const newCommand = require(`../../commands/${category}/${command.name}.js`);
			client.commands.set(newCommand.name, newCommand);
			message.reply(`command \`${command.name}\` was reloaded!`);
		}
		catch (err) { client.error(err, message); }
	},
};