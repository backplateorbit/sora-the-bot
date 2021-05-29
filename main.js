const Discord = require("discord.js")
const twitch = require("twitch")
const twitchAuth = require("twitch-auth")

const client = new Discord.Client()
const authProvider = new twitchAuth.ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET
)
const apiClient = new twitch.ApiClient({ authProvider })

// Probes and then sends new clips to the clip channel.
const fetchNewClips = async (server) => {
    // Get already posted clips.
    const clipChannel = await server.channels.cache.get(process.env.MATT_CLIP_CHANNEL_ID)
    const clipChannelMessages = await clipChannel.messages.fetch()
    const clipUrls = clipChannelMessages.map(
        message => message.content
    )

    // Get clips for the twitch channel.
    const broadcaster = await apiClient.helix.users.getUserByName(process.env.MATT_TWITCH_USERNAME)
    const clips = await (await apiClient.helix.clips.getClipsForBroadcaster(broadcaster)).data

    // Get the clips that haven't already had their URL posted
    const unpostedClips = clips.filter(clip => !clipUrls.includes(clip.url))

    // Post all the unposted clips.
    unpostedClips.map(
        async (clip) => await clipChannel.send(clip.url)
    )

    // Log to console.
    console.log(
        `Found and posting ${unpostedClips.length} new clips.`
    )

}

const createLiveEmbed = (stream) => {
    return new Discord.MessageEmbed()
        .setAuthor(
            "SoraBot",
            "https://cdn.discordapp.com/attachments/846900006467665941/846901529918963712/sora_twitch_emote.jpg",
            "https://github.com/backplateorbit/sora-the-bot"
        ).setTitle(
            ":red_circle: Matt is live!"
        ).setURL(
            "https://www.twitch.tv/mattbey_"
        ).setThumbnail(
            "https://blog.twitch.tv/assets/uploads/generic-email-header-1.jpg"
        ).setColor(
            "#9147ff"
        ).setImage(
            stream.getThumbnailUrl(256, 256)
        ).setDescription(
            stream.title
        ).addField(
            "Streaming", stream.gameName, true,
        ).addField(
            "Start Time", stream.startDate.toString().split(" GMT+0100")[0], true
        ).addField(
            "Viewers", stream.viewers, true
        )
}

const createOfflineEmbed = () => {
    return new Discord.MessageEmbed()
    .setAuthor(
        "SoraBot",
        "https://cdn.discordapp.com/attachments/846900006467665941/846901529918963712/sora_twitch_emote.jpg",
        "https://github.com/backplateorbit/sora-the-bot"
    ).setTitle(
        ":black_circle: Matt is offline!"
    ).setURL(
        "https://www.twitch.tv/mattbey_"
    ).setColor(
        "#9147ff"
    ).setDescription(
        "Matt's offline... but why not watch a VOD?"
    )
}

// Check if Matt streaming.
const checkMattStreaming = async (server) => {
    const stream = await apiClient.helix.streams.getStreamByUserName(process.env.MATT_TWITCH_USERNAME)
    const streamStatusChannel = await server.channels.cache.get(process.env.MATT_STREAM_STATUS_CHANNEL_ID)
    streamStatusChannel.messages.fetch(streamStatusChannel.lastMessageID).then(
        lastMessage => {
            console.log(lastMessage)
            if (!stream) {
                lastMessage.edit(createOfflineEmbed())
            } else {
                lastMessage.edit(createLiveEmbed(stream))
            }
        }
    )
}

client.on("ready", async () => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    server.channels.cache.get(process.env.MATT_STREAM_STATUS_CHANNEL_ID).send("X_X_X_X")
    await checkMattStreaming(server)
    // Set up clip fetcher.
    setInterval(async () => await fetchNewClips(server), 600000)
});

// Move users who join the server to the right permission role.
client.on("guildMemberAdd", async (member) => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    member.roles.add(process.env.THE_BEYS_ROLE_ID)
    console.log(`New member ${member.displayName} added to The Beys.`)
})

client.login(process.env.BOT_KEY)