module.exports = {
	name: 'mad',
	triggers: ['mad', 'angry', 'kill', 'die', 'punch', 'evil'],
	execute(message) {
		message.react('899340907432792105').catch(e => { message.client.logger.error(e); });
	},
};