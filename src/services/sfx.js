const { BotRegisterCommand, client } = require("../../bot");

const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

const streamOptions = { seek: 0, volume: 1 };

let PlayingSound = false;
let qeue = [];
let dispatcher;

function validateYouTubeUrl(url) {
    if (url != undefined || url != '') {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return true
        }
        else {
            return false
        }
    }
}

BotRegisterCommand("!pause", function (args, command, msg) {
    if (PlayingSound) {
        dispatcher.pause();
    } else {
        msg.channel.send("O bot não está tocando uma música!");
    }
});

BotRegisterCommand("!resume", function (args, command, msg) {
    if (PlayingSound) {
        dispatcher.resume();
    } else {
        msg.channel.send("O bot não está tocando uma música!");
    }
});

BotRegisterCommand("!song", function (args, command, msg) {
    if (!args[1]) {
        msg.channel.send("Use: !song <ytb-url>");
    } else {
        // https://www.youtube.com/watch?v=A_EWrzI2CUg
        console.log(validateYouTubeUrl(args[1]))
        if (!validateYouTubeUrl(args[1])) {
            msg.channel.send("Invalid url format!");
        } else {
            if (!PlayingSound) {
                PlayingSound = true
                const channelId = msg.member.voice.channelID;
                const channel = client.channels.cache.get(channelId);
                channel.join().then(con => {
                    function playsong(url) {
                        console.log("[BOT JOINED IN CHANNEL]", channelId);
                        const stream = ytdl(url, { filter: 'audioonly' })
                            .pipe(fs.createWriteStream(path.resolve(__dirname.replace("services", "") + "sounds/music.mp3")));

                        // wait download youtube music;
                        loopid = setInterval(async () => {
                            if (!stream.writableFinished) return;
                            console.log("DOWNLOAD FINISHED");
                            clearInterval(loopid);
                            dispatcher = await con.play(path.resolve(__dirname.replace("services", "") + "sounds/music.mp3"), streamOptions);
                            dispatcher.on("finish", () => {
                                console.log("finished track")
                                if (qeue.length == 0) {
                                    PlayingSound = false;
                                } else {
                                    playsong(qeue[0]);
                                    qeue.shift();
                                }
                            });
                        }, 1000);
                    }

                    playsong(args[1]);
                });
            } else {
                msg.channel.send("Música adicionada na fila!");
                qeue.push(args[1]);
                console.log("[QEUE]", qeue);
            }
        }
    }
});

module.exports = {}