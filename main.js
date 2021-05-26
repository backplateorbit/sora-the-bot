const Discord = require("discord.js")

const client = new Discord.Client()

client.on("ready", async() => {
    console.log("Sora Bot online and waiting for commands...");
    const channels = await client.guilds.fetch(process.env.MATT_SERVER_ID)
    console.log(channels)
});

client.login(process.env.BOT_KEY)