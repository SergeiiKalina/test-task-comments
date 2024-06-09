import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as tmp from 'tmp';
import * as fs from 'fs';

const serviceAccountKey = require('../../../test-arena-gym-d2e2db568333.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  storageBucket: 'gs://test-arena-gym.appspot.com',
});

@Injectable()
export class FileService {
  constructor() {}

  async uploadFile(file: Express.Multer.File) {
    const bucket = admin.storage().bucket();
    const originalName = file.originalname;
    const fileBuffer = file.buffer;

    const tempFilePath = tmp.tmpNameSync();
    fs.writeFileSync(tempFilePath, fileBuffer);

    await bucket.upload(tempFilePath, {
      destination: originalName,
      public: true,
    });

    fs.unlinkSync(tempFilePath);

    return `https://storage.googleapis.com/${bucket.name}/${originalName}`;
  }
}
