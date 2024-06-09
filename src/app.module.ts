import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentModule } from './comment/comment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Comment } from './comment/entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './queue/queue.module';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'redis',
      port: 6379,
    }),
    EventEmitterModule.forRoot({
      maxListeners: 1000,
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('PG_HOST'),
        port: ConfigService.get('PG_PORT'),
        username: ConfigService.get('POSTGRES_USER'),
        password: ConfigService.get('POSTGRES_PASSWORD'),
        database: ConfigService.get('POSTGRES_DB'),
        entities: [Comment, User],

        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GoogleRecaptchaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secretKey = configService.get<string>(
          'GOOGLE_RECAPTCHA_SECRET_KEY',
        );
        return {
          secretKey,
          response: (req) => req.headers.recaptcha,
          skipIf: () => false,
        };
      },
    }),

    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
    CommentModule,
    AuthModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly eventEmitter: EventEmitter2) {
    this.eventEmitter.setMaxListeners(100);
  }
}
