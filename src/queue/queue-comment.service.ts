import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';

@Injectable()
export class CommentQueueService {
  constructor(@InjectQueue('comment') private readonly commentQueue: Queue) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    file: Express.Multer.File,
  ) {
    await this.commentQueue.add('createComment', {
      createCommentDto,
      file,
    });
  }
}
