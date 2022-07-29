module.exports = async (client) => {
	logger.info('Bot started!');
	const timer = (Date.now() - client.startTimestamp) / 1000;
	logger.info(`Done (${timer}s)! I am running!`);
};