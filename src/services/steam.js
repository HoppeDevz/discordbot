const puppeteer = require('puppeteer');

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
    }
}