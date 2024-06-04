import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import { CommentService } from './comment.service';

@Injectable()
export class CommentEventHandler {
  constructor(private readonly commentService: CommentService) {}

  @OnEvent('commentAdded')
  async handleCommentAdded(server: Server) {
    const comments = await this.commentService.getAllComments();

    server.emit('getAllComments', comments);
  }
}
