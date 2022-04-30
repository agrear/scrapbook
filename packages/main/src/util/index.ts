import fs from 'fs';
import mime from 'mime/lite';
import { nanoid } from 'nanoid';
import path from 'path';
import sharp from 'sharp';

export function createId(): string {
  return nanoid();
}

export async function createThumbnail(
  image: Buffer,
  options: sharp.ResizeOptions = {}
) {
  const thumbnail = sharp(image).resize(undefined, undefined, {
    width: 200,
    height: 200,
    fit: 'inside',
    ...options
  });

  const { format, size, width, height } = await thumbnail.metadata();
  const mimeType = format ? mime.getType(format) : 'application/octet-stream';

  return {
    data: await thumbnail.toBuffer(),
    type: mimeType ?? 'application/octet-stream',
    size: size ?? 0,
    width: width ?? 0,
    height: height ?? 0
  };
}

export async function getFiles(p: string): Promise<FileInfo[]> {
  return new Promise((resolve, reject) => {
    fs.stat(p, (error, status) => {
      if (error) {
        return reject(error);
      }

      if (status.isDirectory()) {
        resolve(new Promise((resolve, reject) => {
          fs.readdir(p, async (error, names) => {
            if (error) {
              return reject(error);
            }

            const files: FileInfo[] = [];
            for (const name of names) {
              files.push(...(await getFiles(path.join(p, name))).flat());
            }

            resolve(files);
          });
        }));
      } else if (status.isFile()) {
        resolve([{
          name: path.basename(p),
          path: p,
          size: status.size,
          type: mime.getType(path.extname(p)) ?? 'application/octet-stream'
        }]);
      } else {
        resolve([]);
      }
    });
  });
}

export async function loadImage(file: string): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, async (err, buffer) => {
      if (err) {
        return reject(err);
      }

      const { width, height } = await sharp(buffer).metadata();

      resolve({
        name: path.basename(file),
        path: file,
        width: width ?? 0,
        height: height ?? 0,
        data: buffer,
        type: mime.getType(path.extname(file)) ?? 'application/octet-stream',
        size: buffer.byteLength
      });
    });
  });
}

export function toDate(seconds: number) {
  return new Date(seconds * 1000);
}

export function toUTC(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
