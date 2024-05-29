import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(file: Express.Multer.File): Promise<Buffer> {
    if (!file) {
      throw new BadRequestException('File was not found');
    }

    try {
      let processedBuffer: Buffer;
      if (file.mimetype.startsWith('image')) {
        if (!file.buffer) {
          throw new BadRequestException('File is not correct.');
        }

        processedBuffer = await sharp(file.buffer)
          .resize({
            width: 320,
            height: 240,
            fit: 'contain',
            withoutEnlargement: false,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({ compressionLevel: 9 })
          .toBuffer();
      } else if (file.mimetype.startsWith('text')) {
        if (!file.buffer) {
          throw new BadRequestException('Text file is invalid.');
        }

        processedBuffer = file.buffer;
      } else {
        throw new BadRequestException('Unsupported file type');
      }

      return processedBuffer;
    } catch (error) {
      throw new BadRequestException('Failed');
    }
  }
}
