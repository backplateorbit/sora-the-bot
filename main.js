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

client.on("ready", async() => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    setInterval(async() => await fetchNewClips(server), 600000)
});

client.login(process.env.BOT_KEY)