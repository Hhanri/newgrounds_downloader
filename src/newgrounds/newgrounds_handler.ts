import * as readline from 'node:readline/promises';

import { NewgroundsAuth } from "./newgrounds_auth";
import { NewgroundsScraper } from './newgrounds_scraper';
import { NewgroundsUrl } from './newgrounds_url';
import { VideoDownloader } from '../video_downloader';
import { Credentials } from '../credentials';
import { FileReader } from '../file_reader';


export class NewgroundsHandler {

    private readonly auth: NewgroundsAuth;
    private readonly scraper: NewgroundsScraper;
    private readonly downloader: VideoDownloader;
    private readonly fileReader: FileReader;
    private readonly rl: readline.Interface;
    private readonly credentials?: Credentials;

    constructor(
        auth: NewgroundsAuth,
        scraper: NewgroundsScraper,
        downloader: VideoDownloader,
        fileReader: FileReader,
        rl: readline.Interface,
        credentials?: Credentials,
    ) {
        this.auth = auth;
        this.scraper = scraper;
        this.downloader = downloader;
        this.fileReader = fileReader;
        this.rl = rl;
        this.credentials = credentials;
    }
    
    async signIn(): Promise<void> {
        console.log("--- Login with email and password ---");

        while (!this.auth.isSignedIn) {
            const email = this.credentials?.email ?? await this.rl.question("Email: ");
    
            const password = this.credentials?.password ?? await this.rl.question("Password: ");
    
            const res = await this.auth.signIn(email, password);

            if (!res) console.log("--- Login failure: wrong email/password ---");
        }
        console.log("--- Login success ---");
    }

    async loopSingleRequests(): Promise<void> {
        await this.scraper.setLocalStorage();

        while (true) {
            const input = await this.#getUrlInput();
            if (input === undefined) return;
            await this.#downloadUrl(input);
        }
        
    }

    async #getUrlInput(): Promise<NewgroundsUrl | undefined> {
        while (true) {
            const input = await this.rl.question("[type STOP to exit] Video URL: ");
            if (input === "STOP") return undefined;

            const url = NewgroundsUrl.createAndValidate(input)
            if (url !== undefined) return url;
        }
    }

    async #downloadUrl(url: NewgroundsUrl | undefined): Promise<void> {
        if (url === undefined) return;
        const dlInfo = await this.scraper.get(url);
        if (dlInfo !== undefined) await this.downloader.download(dlInfo);
    }

    async downloadBatchFromFile(filePath: string): Promise<void> {
        await this.scraper.setLocalStorage();
        const lines = await this.fileReader.read(filePath);
        const urls = lines
            .map((e) => NewgroundsUrl.createAndValidate(e))
            .filter((e) => e !== undefined);

        for (const url of urls) {
            await this.#downloadUrl(url);
        }
    }

}