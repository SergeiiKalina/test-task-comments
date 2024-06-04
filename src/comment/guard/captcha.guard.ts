import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { recaptcha } = context.switchToWs().getData();
    const checkCaptcha = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: this.configService.get('GOOGLE_RECAPTCHA_SECRET_KEY'),
          response: recaptcha,
        },
      },
    );
    const success = checkCaptcha.data.success;
    if (!success) {
      throw new BadRequestException('Recaptcha token is required');
    }

    return success;
  }
}
