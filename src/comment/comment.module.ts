import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentQueueService } from 'src/queue/queue-comment.service';
import { QueueModule } from 'src/queue/queue.module';
import { FileService } from './file/file.service';
import { CommentGateway } from './comment.gateway';
import { SharpPipe } from './pipes/sharp.pipe';
import { ValidateTagsHTML } from './pipes/validate-html.pipe';
import { CommentController } from './comment.controller';
import { BullModule } from '@nestjs/bull';
import { CommentEventHandler } from './comment-event-handler';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/entities/user.entity';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User]),

    QueueModule,
    BullModule.registerQueue({
      name: 'comment',
    }),
  ],
  controllers: [CommentController],
  providers: [
    CommentGateway,
    CommentService,
    CommentQueueService,
    FileService,
    SharpPipe,
    ValidateTagsHTML,
    CommentEventHandler,
    Server,
    JwtService,
    CacheService,
  ],
})
export class CommentModule {}
