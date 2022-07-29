const { Embed } = require('guilded.js');

module.exports = {
	name: 'server',
	description: 'Guilded server info',
	aliases: ['s', 'srv', 'guild'],
	cooldown: 10,
	async execute(message, args, client) {
		try {
			const guild = await client.servers.fetch(message.serverId);
			let owner = await client.members.cache.get(`${guild.id}:${guild.ownerId}`);
			if (!owner) owner = await client.members.fetch(guild.id, guild.ownerId);
			const srvEmbed = new Embed()
				.setColor(Math.floor(Math.random() * 16777215))
				.setTitle(guild.name)
				.setThumbnail(guild.iconURL)
				.setFooter(`Owner: ${owner.user.name}`, owner.user.avatar);
			if (guild.raw.banner) srvEmbed.setImage(guild.raw.banner);
			if (guild.timezone) srvEmbed.addFields([{ name: 'Timezone', value: `${guild.timezone}` }]);
			const timestamp = new Date(guild.createdAt);
			const string = timestamp.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
			const members = await client.members.fetchMany(guild.id);
			srvEmbed.addFields([
				{ name: 'Members', value: `${members.size}` },
				{ name: 'Created At', value: `${string}` },
			]);
			if (guild.shortURL) srvEmbed.addFields([{ name: 'Vanity URL', value: `guilded.gg/${guild.shortURL}` }]);
			await message.reply({ embeds: [srvEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};