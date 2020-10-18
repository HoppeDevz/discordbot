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

/*(async () => {
    searchWord = "spider-man"
    axios.default(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${searchWord}&limit=25&offset=0&rating=g&lang=en`)
        .then(response => {
            console.log(response.data)
        })
        .catch(err => console.log(err));
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

BotRegisterCommand("!img", (args, command, msg) => {
    if (!args[1]) {
        msg.channel.send("Use: !img <img-name>");
    } else {
        var options = {
            method: 'GET',
            url: 'https://rapidapi.p.rapidapi.com/images/search',
            params: { q: args[1] },
            headers: {
                'x-rapidapi-host': 'bing-image-search1.p.rapidapi.com',
                'x-rapidapi-key': process.env.API_IMAGES_KEY
            }
        };

        axios.default(options)
            .then(response => {
                const arr = response.data.value;
                const ImgName = arr[0].name;
                const BaseURL = arr[0].contentUrl;

                msg.channel.send(ImgName, { files: [BaseURL] });
            })
            .catch(err => {
                console.log(err);
            })
    }
});

BotRegisterCommand("!csgostatus", (args, command, msg) => {
    if (!args[1]) {
        msg.channel.send("Use: !csgostatus <steamid>");
    } else {
        steam.GetPlayerStatusCSGO(args[1]).then(response => {
            // console.log(response.data);
            const stats = response.data.playerstats.stats;
            const total_kills = stats[0].value;
            const total_deaths = stats[1].value;
            const kd = total_kills / total_deaths;
            const total_planted_bombs = stats[3].value;
            const total_defused_bombs = stats[4].value;
            const total_wins = stats[5].value;
            const total_money_earned = stats[7].value;
            const total_kills_knife = stats[8].value;

            const embed = new Discord.MessageEmbed()
                .setAuthor(msg.author.username, msg.author.avatarURL)
                .addField("Total Kills", total_kills)
                .addField("Total Deaths", total_deaths)
                .addField("KD", kd.toFixed(2))
                .addField("Total Planted Bombs", total_planted_bombs)
                .addField("Total Defused Bombs", total_defused_bombs)
                .addField("Total Wins", total_wins)
                .addField("Total Money Earned", total_money_earned.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }))
                .addField("Total Kills Knife", total_kills_knife)

                .setImage("https://dmarket.com/blog/best-csgo-wallpapers/tercsgo_huc01d3a403c050d47715d6aeed15b344f_839613_1920x1080_resize_q75_lanczos.jpg");

            msg.channel.send(embed);
            console.log(total_kills);
        })
    }
});

BotRegisterCommand("")

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
    BotRegisterCommand,
    client
}

client.login(process.env.BOT_TOKEN);

const sfx = require("./src/services/sfx");