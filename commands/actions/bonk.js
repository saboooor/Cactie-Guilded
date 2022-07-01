const action = require('../../functions/action.js');
module.exports = {
	name: 'bonk',
	description: 'Bonk someone!',
	usage: '<Someone>',
	args: true,
	async execute(message, args, client, lang) {
		try { action(message, message.member, args, 'bonk', lang); }
		catch (err) { client.error(err, message); }
	},
};