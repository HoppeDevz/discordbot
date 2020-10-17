const puppeteer = require('puppeteer');

module.exports = {
    GetStreamStatus: (StreamChannel) => {
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://www.twitch.tv/${StreamChannel}`);

            // await page.waitForNavigation({ waitUntil: 'networkidle2' });

            setTimeout(async () => {
                let title = await page.$$("h2[data-a-target='stream-title']");
                let game = await page.$$("span.tw-font-size-5");
                let livetime = await page.$$("span.live-time");
                let viewers = await page.$$("p[data-a-target='animated-channel-viewers-count']");
                let status = "offline";
                let img = await page.$$("img.tw-block.tw-border-radius-rounded.tw-image.tw-image-avatar");

                if (title[0]) {
                    viewers = await viewers[0].getProperty('textContent');
                    livetime = await livetime[0].getProperty('textContent');
                    title = await title[0].getProperty('textContent');
                    game = await game[0].getProperty('textContent');
                    img = await img[0].getProperty('src');

                    viewers = viewers._remoteObject.value;
                    livetime = livetime._remoteObject.value;
                    title = title._remoteObject.value;
                    game = game._remoteObject.value;
                    img = img._remoteObject.value;
                    status = "online";
                } else {
                    viewers = 0;
                    livetime = 0;
                    title = "NENHUM";
                    game = "NENHUM";
                    status = "offline";
                }

                resolve({ title, game, livetime, viewers, status, img });
            }, 2000)

        });
    }
}