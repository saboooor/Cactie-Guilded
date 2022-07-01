module.exports = {
	name: 'crash',
	description: 'crashes the bot',
	async execute(message, args, client) {
		// Check if user is sab lolololol
		if (message.createdById !== 'AYzRpEe4') return client.error('You can\'t do that!', message, true);
		new Promise((resolve, reject) => reject('Manually Crashed'));
	},
};