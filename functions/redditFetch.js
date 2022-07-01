const { Embed } = require('guilded.js');
const { nsfw } = require('../lang/int/emoji.json');
module.exports = async function redditFetch(subreddits, message, client, attempts) {
	if (!attempts) attempts = 1;
	const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
	client.logger.info(`Fetching an image from r/${subreddit}... (attempt ${attempts})`);
	const json = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`).catch(err => {
		return client.error(`Ran into a problem, please try again later\nhttps://www.reddit.com/r/${subreddit}/random.json\n${err}`, message);
	});
	const pong = await json.json().catch(err => {
		return client.error(`Ran into a problem, please try again later\nhttps://www.reddit.com/r/${subreddit}/random.json\n${err}`, message);
	});
	if (!pong) return;
	if (pong.message == 'Not Found') return client.error(`Invalid subreddit! r/${subreddit}`, message);
	if (!pong[0]) pong[0] = pong;
	if (!pong[0]) {
		client.logger.error(JSON.stringify(pong));
		return client.error('Invalid data! Try again later.', message);
	}
	const data = pong[0].data.children[0].data;
	if (data.selftext) return redditFetch(subreddits, message, client, attempts + 1);
	client.logger.info(`Image URL: ${data.url}`);
	if (!data.url.includes('i.redd.it') && !data.url.includes('v.redd.it') && !data.url.includes('i.imgur.com') && !data.url.includes('redgifs.com/watch/')) return redditFetch(subreddits, message, client, attempts + 1);
	if (data.over_18 && (await client.channels.fetch(message.channelId)).name.toLowerCase() != 'nsfw') return client.error('The content on this command is NSFW!\nTo view this sensitive content:\n- Execute this command in a channel named \'NSFW\'\n- Create a channel named \'NSFW\'', message, true);
	const timestamp = parseInt(`${data.created}` + '000');
	const PostEmbed = new Embed()
		.setColor(Math.floor(Math.random() * 16777215))
		.setAuthor(`u/${data.author}`, null, `https://reddit.com/u/${data.author}`)
		.setTitle(`${data.over_18 ? `<:nsfw:${nsfw}>  ` : ''}${data.title}`)
		.setDescription(`**${data.ups} Upvotes** (${data.upvote_ratio * 100}%)`)
		.setURL(`https://reddit.com${data.permalink}`)
		.setFooter(`Fetched from r/${data.subreddit}`)
		.setTimestamp(timestamp);
	if (data.url.includes('redgifs.com/watch/')) return redditFetch(subreddits, message, client, attempts + 1);
	if (data.url.includes('v.redd.it')) data.url = `${data.url}/DASH_480.mp4?source=fallback`;
	PostEmbed.setImage(data.url);
	let files;
	if (data.url.endsWith('.mp4') || data.url.endsWith('.gifv') || data.url.endsWith('DASH_480.mp4?source=fallback')) files = [{ attachment: data.url, name: data.url.split('/').pop() }];
	message.reply({ embeds: [PostEmbed], files }).catch(err => {
		client.logger.error(err);
		return redditFetch(subreddits, message, client, attempts + 1);
	});
};
