import { createWriteStream } from 'fs';
import promises from 'node:fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ReadableStream } from 'stream/web';

export async function downloadFile(url: string, filepath: string) {
    const response = await fetch(url, {
        redirect: 'follow',
    });
    const body = Readable.fromWeb(response.body as ReadableStream);
    const tempFilepath = `${filepath}.tmp`;
    const download_write_stream = createWriteStream(tempFilepath);
    await finished(body.pipe(download_write_stream));
    await promises.rename(tempFilepath, filepath);
}
