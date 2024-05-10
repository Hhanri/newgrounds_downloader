import readline from 'node:readline/promises';
import * as fs from 'fs';

export class FileReader {

    async read(filePath: string): Promise<string[]> {
        const res = [];
        const fileStream = fs.createReadStream(filePath);
        const rl  = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        for await (const line of rl) {
            res.push(line);
        }
        return res;
    }

}