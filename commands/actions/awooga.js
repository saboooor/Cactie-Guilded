const action = require('../../functions/action.js');

module.exports = {
	name: 'awooga',
	description: 'AWOOGAA!',
	usage: '[Someone]',
	async execute(message, args, client, lang) {
		try { action(message, message.member, args, 'awooga', lang); }
		catch (err) { client.error(err, message); }
	},
};