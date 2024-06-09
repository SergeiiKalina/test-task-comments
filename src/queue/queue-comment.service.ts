import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import { SortCommentsDto } from 'src/comment/dto/sorted.dto';

@Injectable()
export class CommentQueueService {
  constructor(
    @InjectQueue('comment') private readonly commentQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createComment(
    newComment: CreateCommentDto,
    file: Express.Multer.File | null,
    server: Server,
    clientId: string,
  ) {
    const job = await this.commentQueue.add('createComment', {
      newComment,
      file,
    });

    await job.finished();

    await this.eventEmitter.emit('commentAdded', server, clientId);
  }
  async sortedComments(
    sortDto: SortCommentsDto,
    clientId: string,
    server: Server,
  ) {
    const job = await this.commentQueue.add('sortedComments', {
      sortDto,
      clientId,
    });
    await job.finished();

    await this.eventEmitter.emit('getSortedComment', server, clientId);
  }
}
