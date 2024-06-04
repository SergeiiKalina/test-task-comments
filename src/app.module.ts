import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentModule } from './comment/comment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Comment } from './comment/entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './queue/queue.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';

import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: ConfigService.get('DB_PORT'),
        username: ConfigService.get('DB_USER_NAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_DATA_BASE '),
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
        host: 'localhost',
        port: 6379,
      },
    }),
    CommentModule,
    UserModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
