import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('File was not found');
    }

    if (file.mimetype.startsWith('image')) {
      if (!file.buffer) {
        throw new BadRequestException('File is not correct.');
      }

      const processedBuffer = await sharp(file.buffer)
        .resize({
          width: 320,
          height: 240,
          fit: 'contain',
          withoutEnlargement: false,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      return {
        ...file,
        originalname: Date.now().toString() + '.png',
        buffer: processedBuffer,
      };
    } else if (file.mimetype.startsWith('text')) {
      if (!file.buffer) {
        throw new BadRequestException('Text file is invalid.');
      }

      if (file.size > 1024 * 100) {
        throw new BadRequestException(
          'The text file should not be larger than 100Kb.',
        );
      }

      return { ...file, originalname: Date.now().toString() + '.txt' };
    } else {
      throw new BadRequestException('Unsupported file type');
    }
  }
}
