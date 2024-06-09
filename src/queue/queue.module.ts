import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CommentProcessor } from './comment.procesor';
import { CommentQueueService } from './queue-comment.service';
import { CommentService } from 'src/comment/comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { FileService } from 'src/comment/file/file.service';
import { SharpPipe } from 'src/comment/pipes/sharp.pipe';
import { ValidateTagsHTML } from 'src/comment/pipes/validate-html.pipe';
import { User } from 'src/auth/entities/user.entity';
import { CacheService } from 'src/comment/cache/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User]),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'comment',
    }),
  ],
  providers: [
    CommentProcessor,
    CommentService,
    CommentQueueService,
    FileService,
    SharpPipe,
    ValidateTagsHTML,
    CacheService,
  ],
  exports: [BullModule],
})
export class QueueModule {}
