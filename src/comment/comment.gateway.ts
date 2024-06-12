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
import {
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { RecaptchaGuard } from '../auth/guards/captcha.guard';
import { FileInterceptor } from './interceptors/file.interceptor';
import { CommentQueueService } from '../queue/queue-comment.service';
import { WsJwtGuard } from '../auth/guards/jwt.guard';
import { SortCommentsDto } from './dto/sorted.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateCommentDto } from './dto/create-comment.dto';

@WebSocketGateway({ cors: true, maxHttpBufferSize: 1e8 })
export class CommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly commentService: CommentService,
    public readonly commentQueueService: CommentQueueService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
  async handleDisconnect(client: Socket) {
    await this.cacheManager.del(`sortParams_${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('addComments')
  @UseGuards(RecaptchaGuard)
  @UseInterceptors(FileInterceptor)
  async handleAddComment(
    @ConnectedSocket() client: any,
    @MessageBody() newComment: ICreateComment,
  ): Promise<void> {
    try {
      const { file, ...restComment } = newComment;

      const user = client.user;

      let createCommentObject = {
        ...restComment,
        userName: user.userName,
        email: user.email,
        authorId: user.id,
      };

      await this.commentQueueService.createComment(
        createCommentObject,
        file,
        this.server,
        client.id,
      );
    } catch (error) {
      client.emit('exception', {
        status: error.status,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('getSortedComments')
  async handleGetSortedComments(
    @MessageBody() sortDto: SortCommentsDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.commentQueueService.sortedComments(
      sortDto,
      client.id,
      this.server,
    );
  }

  @SubscribeMessage('getFirstPage')
  async handleGetAllComments(client: Socket): Promise<void> {
    const comments = await this.commentService.getSortedComments(
      { field: 'createdAt', order: 'DESC', page: 1 },
      client.id,
    );

    client.emit('getFirstPage', comments);
  }
}
