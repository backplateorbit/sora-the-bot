const Discord = require("discord.js")
const twitch = require("twitch")
const twitchAuth = require("twitch-auth")

const client = new Discord.Client()
const authProvider = new twitchAuth.ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SERVER
)
const apiClient = new twitch.ApiClient({authProvider})

const clipChannel = await client.guilds.fetch(process.env.MATT_SERVER_ID)

client.on("ready", async() => {
    console.log(clipChannel)
});

client.login(process.env.BOT_KEY)