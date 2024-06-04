import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { FileService } from './file.service';
import { ValidateTagsHTML } from './pipes/validate-html.pipe';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly fileService: FileService,
    private readonly validationHTML: ValidateTagsHTML,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createCommentDto: CreateCommentDto, file: Express.Multer.File) {
    let parent: Comment = null;
    if (createCommentDto.parent) {
      parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parent },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent comment with id ${createCommentDto.parent} not found`,
        );
      }
    }

    const processedText = await this.validationHTML.transform(
      createCommentDto.text,
    );

    const urlFile = await this.fileService.uploadFile(file);

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      text: processedText,
      parent,
      file: urlFile,
    });

    const savedComment = await this.commentRepository.save(newComment);

    return savedComment;
  }

  async getAllComments() {
    const cacheComments = await this.cacheManager.get('allComment');

    if (!cacheComments) {
      const comments = await this.commentRepository.find({
        relations: ['parent'],
        order: {
          createdAt: 'DESC',
        },
      });
      const commentMap = new Map<number, Comment>();
      comments.forEach((comment) => {
        comment.answers = [];
        commentMap.set(comment.id, comment);
      });

      const rootComments: Comment[] = [];

      comments.forEach((comment) => {
        if (comment.parent) {
          const parent = commentMap.get(comment.parent.id);
          if (parent && parent.id !== comment.id) {
            parent.answers.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      await this.cacheManager.set('allComment', rootComments);
      return rootComments;
    }
    return cacheComments;
  }
}
