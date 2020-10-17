require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const steam = require("./src/services/steam");
const twitch = require("./src/services/twitch");

/*(async () => {
    twitch.GetStreamStatus("tfue").then(res => console.log(res));
})();*/

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

function BotRegisterCommand(CommandName, CallBack) {
    client.on("message", msg => {
        const list = msg.content.split(" ");
        const command = list[0];
        if (command == CommandName) {
            CallBack(list, command, msg);
        }
    });
}

BotRegisterCommand("!topsellers", function (args, command, msg) {
    // args[1] =>
    // command =>

    steam.GetTopSellers().then(res => {
        const list = res;
        const d = new Date()
        const [time, minutes] = [d.getHours(), d.getMinutes()];
        let sendMsg = `:100: **TOP GAMES STEAM ${time}:${minutes}** :100: \n`;
        sendMsg = sendMsg + "```\n";
        list.map((item, pos) => {
            if (pos > 9) return;
            sendMsg = sendMsg + `${pos + 1} - ${item} \n`;
        });

        sendMsg = sendMsg + "\n```";
        msg.channel.send(sendMsg);
    });
});

BotRegisterCommand("!twitch", function (args, command, msg) {
    if (args[1]) {
        twitch.GetStreamStatus(args[1]).then(res => {
            const object = res;
            const embed = new Discord.MessageEmbed()
                .setAuthor(msg.author.username, msg.author.defaultAvatarURL)
                .addField("Title", object.title)
                .addField("Game", object.game)
                .addField("Viewers", object.viewers)
                .addField("LiveTime", object.livetime)
                .addField("Status", object.status)
                .setImage(object.img);

            if (object.status == "online") {
                msg.channel.send(embed);
            } else {
                msg.channel.send("Este canal está offline!");
            }

        });
    }
});

module.exports = {
    BotRegisterCommand
}

client.login(process.env.BOT_TOKEN);