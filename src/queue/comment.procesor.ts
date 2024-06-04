import { Process, Processor } from '@nestjs/bull';
import { CommentService } from '../comment/comment.service';
import { Job } from 'bull';

@Processor('comment')
export class CommentProcessor {
  constructor(private readonly commentService: CommentService) {}
  @Process()
  async handleAddComment(job: Job<{ newComment: any; file: any }>) {
    const { newComment, file } = job.data;
    const processedFile = {
      ...file,
      buffer: Buffer.from(file.buffer.data),
    };

    await this.commentService.create(newComment, processedFile);
  }
}
