const Discord = require("discord.js")
import { ApiClient } from "twitch"
import { ClientCredentialsAuthProvider } from "twitch-auth"

const client = new Discord.Client()
const authProvider = new ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SERVER
)
const apiClient = new ApiClient({authProvider})

const clipChannel = await client.guilds.fetch(process.env.MATT_SERVER_ID)

client.on("ready", async() => {
    console.log(clipChannel)
});

client.login(process.env.BOT_KEY)