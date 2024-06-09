import { Process, Processor } from '@nestjs/bull';
import { CommentService } from '../comment/comment.service';
import { Job } from 'bull';
import { SortCommentsDto } from 'src/comment/dto/sorted.dto';

@Processor('comment')
export class CommentProcessor {
  constructor(private readonly commentService: CommentService) {}
  @Process('createComment')
  async handleAddComment(job: Job<{ newComment: any; file: any }>) {
    const { newComment, file } = job.data;

    const processedFile = file
      ? {
          ...file,
          buffer: Buffer.from(file.buffer.data),
        }
      : null;

    await this.commentService.create(newComment, processedFile);
  }
  @Process('sortedComments')
  async handleSortComment(
    job: Job<{ sortDto: SortCommentsDto; clientId: string }>,
  ) {
    const { sortDto, clientId } = job.data;

    await this.commentService.getSortedComments(sortDto, clientId);
  }
}
