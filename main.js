const Discord = require("discord.js")
const twitch = require("twitch")
const twitchAuth = require("twitch-auth")

const client = new Discord.Client()
const authProvider = new twitchAuth.ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SERVER
)
const apiClient = new twitch.ApiClient({authProvider})

// Probes and then sends new clips to the clip channel.
const fetchNewClips = async(clipChannel) => {
    console.log("AH")
}

client.on("ready", async() => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    const clipChannel = await server.channels.cache.find(
        (channel) => channel.id === process.env.MATT_CLIP_CHANNEL_ID
    )

    const clipChannelMessages = await clipChannel.messages.fetch({limit: 0})
    console.log(clipChannelMessages)
});

client.login(process.env.BOT_KEY)