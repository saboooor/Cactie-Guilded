const action = require('../../functions/action.js');

module.exports = {
	name: 'mad',
	description: 'Stay mad',
	usage: '<Someone>',
	args: true,
	async execute(message, args, client, lang) {
		try { action(message, message.member, args, 'mad', lang); }
		catch (err) { client.error(err, message); }
	},
};