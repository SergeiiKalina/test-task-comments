import { Controller, Get } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @CacheKey('allComment')
  @CacheTTL(10000)
  async getAllComment() {
    return this.commentService.getAllComments();
  }
}
