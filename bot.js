require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const steam = require("./src/services/steam");
const twitch = require("./src/services/twitch");
const axios = require("axios");

/*client.music = require("discord.js-musicbot-addon");

client.music.start(client, {
    youtubeKey: 'UsnRQJxanVM'
});*/

(async () => {
    searchWord = "spider-man"
    axios.default(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${searchWord}&limit=25&offset=0&rating=g&lang=en`)
        .then(response => {
            console.log(response.data)
        })
        .catch(err => console.log(err));
})();

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

BotRegisterCommand("!gamestatus", function (args, command, msg) {
    if (!args[1]) {
        msg.channel.send("Use: !gamestatus <game>");
    } else {
        steam.GetGameStatus(args[1]).then(res => {
            msg.channel.send(res.InGameCounter);
        }).catch(err => {
            msg.channel.send("Este jogo não está disponível!");
            msg.channel.send("Confira a lista de jogos disponíveis:");
            msg.channel.send(err.gamelist);
        })
    }
});

BotRegisterCommand("!gif", function (args, command, msg) {
    if (!args[1]) {
        msg.channel.send("Use: !gif <gif-name>");
    } else {
        axios.default(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${args[1]}&limit=25&offset=0&rating=g&lang=en`)
            .then(response => {
                const arr = response.data.data;

                const gifID = arr[0].id;
                const baseURL = `https://media2.giphy.com/media/${gifID}/giphy.gif`;

                msg.channel.send("", { files: [baseURL] });
            })
            .catch(err => console.log(err));
    }
});

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