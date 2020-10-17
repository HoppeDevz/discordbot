const puppeteer = require('puppeteer');
const axios = require("axios");

let GameList = "``` \n CSGO \n ```";

let GameNameIds = {
    "CSGO": 730
}

module.exports = {
    GetTopSellers: () => {
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("https://store.steampowered.com/search/?os=win&filter=globaltopsellers");

            setTimeout(async () => {
                const titles = await page.$$(".title");
                let arr = [];
                let first = true;
                let pos = 0;
                titles.map(async title => {
                    if (first) return first = !first;
                    const x = await title.getProperty('textContent');
                    arr.push(x._remoteObject.value);
                    pos = pos + 1;
                    if (pos == 10) return resolve(arr);
                });
                // console.log((await titles[0].getProperty('textContent')).jsonValue());
            }, 2000)
        });
    },

    GetGameStatus: (GameName) => {
        return new Promise(async (resolve, reject) => {
            if (!GameNameIds[GameName]) return reject({ error: true, gamelist: GameList });
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://steamcommunity.com/app/${GameNameIds[GameName]}`);

            let InGameCounter = await page.$$(".apphub_NumInApp");

            if (InGameCounter[0]) {
                InGameCounter = await InGameCounter[0].getProperty('textContent');
                InGameCounter = InGameCounter._remoteObject.value;

                return resolve({ InGameCounter });
            }
        })
    },

    // http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=<<KEY>>&steamid=<<PROFILEID>>
    GetPlayerStatusCSGO: (SteamID) => {
        return new Promise((resolve, reject) => {
            axios.default.get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${process.env.STEAM_WEB_API_KEY}&steamid=${SteamID}`)
                .then(response => {
                    resolve({ error: false, data: response.data })
                })
                .catch(err => {
                    reject({ error: true })
                })
        });
    }
}