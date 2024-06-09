import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { SharpPipe } from '../pipes/sharp.pipe';

@Injectable()
export class FileInterceptor implements NestInterceptor<any, any> {
  constructor(private readonly sharpPipe: SharpPipe) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const data = context.switchToWs().getData();

    if (!data.file) {
      return next.handle().pipe(
        map((result) => {
          return { ...result, file: null };
        }),
      );
    }

    const file = data.file;
    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: file.fileName,
      encoding: '7bit',
      mimetype: file.mimeType,
      size: file.size,
      buffer: Buffer.from(new Uint8Array(file.content)),
      stream: null,
      destination: '',
      filename: '',
      path: '',
    };

    const processedFile = await this.sharpPipe.transform(multerFile);
    data.file = processedFile;

    return next.handle().pipe(
      map((result) => {
        return { ...result, file: processedFile };
      }),
    );
  }
}
