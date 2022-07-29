const action = require('../../functions/action.js');

module.exports = {
	name: 'nuzzle',
	description: 'Nuzzle someone!',
	usage: '<Someone>',
	args: true,
	async execute(message, args, client, lang) {
		try { action(message, message.member, args, 'nuzzle', lang); }
		catch (err) { client.error(err, message); }
	},
};