import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SharpPipe } from './pipes/sharp.pipe';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountKey = require('../../test-arena-gym-d2e2db568333.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  storageBucket: 'gs://test-arena-gym.appspot.com',
});

@Injectable()
export class FileService {
  constructor(private readonly filePipe: SharpPipe) {}
  async uploadFile(file: Express.Multer.File) {
    const bucket = admin.storage().bucket();

    const originalName = file.originalname;
    const filePath = path.join(`src/comment/file/${originalName}`);

    fs.writeFile(filePath, file.buffer, () => {});
    await bucket.upload(filePath, {
      public: true,
    });
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`file ${file.originalname} has not delete`);
      }
    });

    return `https://storage.googleapis.com/${bucket.name}/${originalName}`;
  }
}
