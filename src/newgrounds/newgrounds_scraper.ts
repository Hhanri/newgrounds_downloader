import { Browser } from "puppeteer";
import { DownloadInfo } from "../video_downloader";
import { NewgroundsUrl } from "./newgrounds_url";

export class NewgroundsScraper {

    private readonly browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async setLocalStorage(): Promise<void> {
        const page = (await this.browser.pages())[0];
        await page.evaluate(() => {
            localStorage.setItem('_ngPlayerVolume_', '0');
            localStorage.setItem('_ngPreferredVideoResv2_', '"4K"');
        });
    }

    async get(url: NewgroundsUrl): Promise<DownloadInfo | undefined> {

        const page = await this.browser.newPage();
        const res = await page.goto(url.value);
        if (!res.ok()) {
            console.log(`Error: ${res.status()} - Something went wrong while fetching ${url}`);
            return undefined;
        }

        const titleElement = await page.$("head title");
        const title = await titleElement.evaluate((e) => e.textContent);

        const videoPlayerSelector = "#ng-global-video-player div.ng-video-player";
        const videoPlayerElement = await page.waitForSelector(videoPlayerSelector);

        const playerControllerElement = await videoPlayerElement.$("div.ng-video-ui div.ng-video-ui-inner div.flexbox.align-center");

        const videoControlsElement = await playerControllerElement.$('div.ng-video-controls');

        const playButton = await videoControlsElement.waitForSelector('button[data-action="play"]');
        try {
            await playButton.click();
        } catch (_) {
            console.log(`Error: ${url.value} is not a video`)
            return undefined;
        }

        const pauseButton = await videoControlsElement.waitForSelector('button[data-action="pause"]:not([style="display: none;"])');
        await pauseButton.click();

        const video = await videoPlayerElement.$('video source[type="video/mp4"]');
        const videoUrl = await (await video.getProperty("src")).jsonValue();
    
        const authorElement = await videoPlayerElement.$('div.ng-video-meta a.ng-video-link strong[data-value="author"');
        const authorContent = await authorElement.evaluate(e => e.textContent);
        const author = authorContent.slice(3);

        await page.close();

        return {
            author: author,
            title: title,
            videoUrl: videoUrl,
        };
    }

}

/*
- play
- select max quality
- extract the video url
- save video video
*/