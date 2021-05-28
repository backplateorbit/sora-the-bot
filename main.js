const Discord = require("discord.js")
const twitch = require("twitch")
const twitchAuth = require("twitch-auth")

const client = new Discord.Client()
const authProvider = new twitchAuth.ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SERVER
)
const apiClient = new twitch.ApiClient({authProvider})

client.on("ready", async() => {
    const server = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    const clipChannel = await server.channels.cache.find(
        (channel) => channel.id === process.env.MATT_CLIP_CHANNEL_ID
    )
    console.log(server)
    console.log(clipChannel)
});

client.login(process.env.BOT_KEY)