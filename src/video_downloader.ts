import * as fs from "fs";
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';

export type DownloadInfo = {
    author: string;
    title: string;
    videoUrl: string;
};

export class VideoDownloader {

    private readonly root: string;
    private readonly fileNamer: FileNamer;
    private readonly authorDirPather: AuthorDirPather;

    constructor(
        root: string,
        fileNamer: FileNamer = defaultFileNamer,
        authorDirPather: AuthorDirPather = defaultAuthorDirPather,
    ) {
        this.root = root;
        this.fileNamer = fileNamer;
        this.authorDirPather = authorDirPather;
    }
 
    async download(info: DownloadInfo): Promise<void> {
        const dir = this.authorDirPather(this.root, info.author);
        const filePath = this.fileNamer(dir, info);

        const resp = await fetch(info.videoUrl);
        if (!resp.ok || !resp.body) {
            console.log(`Error: could not download ${info.title}`);
            return;
        }

        this.createRoot()
        this.createAuthorDirectory(info.author);

        const writer = fs.createWriteStream(filePath);
        const total = parseInt(resp.headers.get('content-length'), 10);

        await new Promise<void>((resolve, _) => {
            let dl: number = 0;
            Readable
                .fromWeb(resp.body as ReadableStream<Uint8Array>)
                .on('data', (chunk: Buffer) => {
                    dl += chunk.byteLength;
                    printProgress(info.title, dl*100/total);
                })
                .pipe(writer)
                .on('finish', resolve)
                .on('error', () => {
                    fs.unlinkSync(filePath);
                    console.log(`Error: could not download ${info.title}`)
                });
        });

        console.log(`Success: downloaded ${info.title} to ${filePath}`);
    }
    
    #createDir(path: string) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    createRoot() {
        this.#createDir(this.root);
    }
    
    createAuthorDirectory(author: string) {
        this.#createDir(this.authorDirPather(this.root, author))
    }

}

export type FileNamer = (root: string, info: DownloadInfo) => string;

export const defaultFileNamer: FileNamer = (root: string, info: DownloadInfo) => {
    return `${root}${info.author} - ${info.title.replaceAll('/', '-')}.mp4`;
}

export type AuthorDirPather = (root: string, author: string) => string;

export const defaultAuthorDirPather: AuthorDirPather = (root: string, author: string) => {
    return `${root}${author}/`;
}

function printProgress(title: string, progress: number) {
    process.stdout.write(title + ': ' + progress.toFixed(2) + '%');
    process.stdout.cursorTo(0);
}