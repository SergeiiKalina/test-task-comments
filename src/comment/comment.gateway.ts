import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentService } from './comment.service';
import { ICreateComment } from './interface/comment.interface';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RecaptchaGuard } from './guard/captcha.guard';
import { FileInterceptor } from './interceptors/file.interceptor';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: true, maxHttpBufferSize: 1e8 })
export class CommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly commentService: CommentService,
    @InjectQueue('comment') private readonly commentQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
  @SubscribeMessage('addComments')
  @UseGuards(RecaptchaGuard)
  @UseInterceptors(FileInterceptor)
  async handleAddComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() newComment: ICreateComment,
  ): Promise<void> {
    const { file, ...restComment } = newComment;

    const job = await this.commentQueue.add({
      newComment: restComment,
      file,
    });
    await job.finished();
    await this.eventEmitter.emit('commentAdded', this.server);
  }

  @SubscribeMessage('getAllComments')
  async handleGetAllComments(client: Socket): Promise<void> {
    const comments = await this.commentService.getAllComments();
    client.emit('comments', comments);
  }
}
