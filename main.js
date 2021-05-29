const Discord = require("discord.js")
const twitch = require("twitch")
const twitchAuth = require("twitch-auth")

const client = new Discord.Client()
const authProvider = new twitchAuth.ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET
)
const apiClient = new twitch.ApiClient({authProvider})

// Probes and then sends new clips to the clip channel.
const fetchNewClips = async(server) => {
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
        async(clip) => await clipChannel.send(clip.url)
    )

    // Log to console.
    console.log(
        `Found and posting ${unpostedClips.length} new clips.`
    )
    
}

// Check Matt Streaming
const checkMattStreaming = async(server) => {
    // Get Matt's stream.
    const stream = await apiClient.helix.streams.getStreamByUserName(process.env.MATT_TWITCH_USERNAME)

    if (!stream) {
        // Matt isn't streaming, no point doing anything else...
        return
    }

    const streamStatusChannel = await server.channels.cache.get(process.env.MATT_STREAM_STATUS_CHANNEL_ID)

    // Get the most recent message in the Status Channel.
    const streamStatusChannelMessage = await streamStatusChannel.messages.fetch({limit: 1})

    // We need to do a check to see if we've already announced this stream.
    // If we have, we need to edit the message with any new stuff as an Embed.
    
    // Grab the message embed.
    const streamStatusEmbed = streamStatusChannelMessage.embeds[0]
    const streamStatusStreamId = streamStatusEmbed.fields.find((embedField) => embedField.name === "id").value

    if (stream.id === streamStatusStreamId) {
        // We have already announced the stream. We just need to update the Embed.
    }



    

client.on("ready", async() => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)

    // Set up clip fetcher.
    setInterval(async() => await fetchNewClips(server), 600000)
});

// Move users who join the server to the right permission role.
client.on("guildMemberAdd", async(member) => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    member.roles.add(process.env.THE_BEYS_ROLE_ID)
    console.log(`New member ${member.displayName} added to The Beys.`)
})

client.login(process.env.BOT_KEY)