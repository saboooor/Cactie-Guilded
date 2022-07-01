const action = require('../../functions/action.js');
module.exports = {
	name: 'giggle',
	description: 'hehehehehehehe',
	usage: '[Someone]',
	async execute(message, args, client, lang) {
		try { action(message, message.member, args, 'giggle', lang); }
		catch (err) { client.error(err, message); }
	},
};