const Discord = require("discord.js")

const client = new Discord.Client()

client.on("ready", () => {
    console.log("Sora Bot online and waiting for commands...");
});

client.login(process.env.BOT_KEY)