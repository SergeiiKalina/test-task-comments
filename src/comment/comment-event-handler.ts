import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import { CommentService } from './comment.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SortCommentsDto } from './dto/sorted.dto';

@Injectable()
export class CommentEventHandler {
  constructor(
    private readonly commentService: CommentService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @OnEvent('commentAdded')
  async handleCommentAdded(server: Server, clientId: string) {
    await server.emit(
      'sortedComments',
      await this.commentService.getSortedComments(
        await this.cacheManager.get(`sortParams_${clientId}`),
        clientId,
      ),
    );
  }
  @OnEvent('getSortedComment')
  async handleGetSortedComment(server: Server, clientId: string) {
    const sortParams = await this.cacheManager.get<SortCommentsDto>(
      `sortParams_${clientId}`,
    );

    if (!sortParams) {
      await server.emit(
        'sortedComments',
        await this.commentService.getSortedComments(
          { field: 'createdAt', order: 'DESC', page: 1 },
          clientId,
        ),
      );
      return;
    }
    await server.emit(
      'sortedComments',
      await this.commentService.getSortedComments(sortParams, clientId),
    );
  }
}
