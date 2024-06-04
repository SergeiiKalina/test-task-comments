import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentQueueService } from 'src/queue/queue-comment.service';
import { QueueModule } from 'src/queue/queue.module';
import { CommentProcessor } from 'src/queue/comment.procesor';
import { FileService } from './file.service';
import { CommentGateway } from './comment.gateway';
import { SharpPipe } from './pipes/sharp.pipe';
import { ValidateTagsHTML } from './pipes/validate-html.pipe';
import { CommentController } from './comment.controller';
import { BullModule } from '@nestjs/bull';
import { CommentEventHandler } from './comment-event-handler';
import { Server } from 'socket.io';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
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
  ],
})
export class CommentModule {}
