import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient() as Socket;
    const authToken = client.handshake.headers.authorization as string;

    try {
      if (!authToken) {
        throw new BadRequestException('Missing authorization token ');
      }
      const token = authToken.split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client['user'] = {
        userName: payload.userName,
        homePage: payload.homePage,
        email: payload.email,
        id: payload.id,
      };

      return true;
    } catch (error) {
      client.emit('exception', { message: error.message });
    }
  }
}
