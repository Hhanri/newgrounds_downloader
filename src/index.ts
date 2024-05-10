import readline from 'node:readline/promises';

import puppeteer from "puppeteer";
import { NewgroundsAuth } from "./newgrounds/newgrounds_auth";
import { NewgroundsHandler } from './newgrounds/newgrounds_handler';
import { NewgroundsScraper } from './newgrounds/newgrounds_scraper';
import { VideoDownloader } from './video_downloader';
import creds from "./credentials.json";
import { FileReader } from './file_reader';
import minimist from "minimist" ;

async function main() {

    const args = minimist(process.argv);
    const file = args['file'];
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        crlfDelay: Infinity,
    });

    const path = `${process.cwd()}/output/`;

    const browser = await puppeteer.launch({
        headless: true,
    });

    const downloader = new VideoDownloader(path);
    const auth = new NewgroundsAuth(browser);
    const scraper = new NewgroundsScraper(browser);
    const fileReader= new FileReader();

    const ngHandler = new NewgroundsHandler(auth, scraper, downloader, fileReader, rl, creds);
    
    await ngHandler.signIn();

    if (file === undefined) {
        await ngHandler.loopSingleRequests();
    } else {
        await ngHandler.downloadBatchFromFile(file)
    }

    await browser.close();
    rl.close();
}

main()
