const { token, prefix, guildID } = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const Database = require('simplest.db');
const db = new Database({
    path: './db.json'
})

client.once("ready", () => {
    console.log("Ready to watch AFK channels!");
    client.user.setStatus('invisible')
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
    //console.log(newMember.channel)
    if (newMember.channel && newMember.guild.afkChannelID && newMember.channel.id == newMember.guild.afkChannelID) {
        let log_channel = db.get("log_channel");
        if (!log_channel) (newMember.guild.systemChannelID ? log_channel = newMember.guild.systemChannelID : log_channel = undefined)
        if (!log_channel) return
        client.channels.fetch(log_channel).then(chan => {
            chan.send({
                embed: {
                    description: ":inbox_tray: <@" + newMember.id + "> joined AFK channel",
                    color: 13072128
                }
            });
        })
    }

    if (oldMember.channel && oldMember.guild.afkChannelID && oldMember.channel.id == oldMember.guild.afkChannelID) {
        let log_channel = db.get("log_channel");
        if (!log_channel) (oldMember.guild.systemChannelID ? log_channel = oldMember.guild.systemChannelID : log_channel = undefined)
        if (!log_channel) return
        client.channels.fetch(log_channel).then(chan => {
            chan.send({
                embed: {
                    description: ":outbox_tray: <@" + oldMember.id + "> left AFK channel",
                    color: 13041664
                }
            });
        })
    }
})



client.on("message", async message => {
    if (message.author.bot || !message.guild || !message.guild.id == guildID) return;
    if (!message.content.startsWith(prefix)) return; //if message doesn't start with prefix then return
    var args;
    if (message.content.startsWith(prefix)) {
        args = message.content.slice(prefix.length).split(/ +/)
    }
    if (args[0] === "") {
        args.shift()
    }
    if (args[0] === undefined) return;
    const command = args.shift().toLowerCase();
    switch (command) {
        case "here":
            if (message.member.hasPermission('ADMINISTRATOR')) {
                db.set("log_channel", message.channel.id);
                message.channel.send(":white_check_mark: **Set logging channel!**")
            }
            break;
    }
})


client.login(token)