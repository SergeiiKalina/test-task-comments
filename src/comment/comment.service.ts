import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { FileService } from './file/file.service';
import { ValidateTagsHTML } from './pipes/validate-html.pipe';
import { SortCommentsDto } from './dto/sorted.dto';
import { User } from '../auth/entities/user.entity';
import { CacheService } from './cache/cache.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
    private readonly validationHTML: ValidateTagsHTML,
    private readonly cacheService: CacheService,
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    file: Express.Multer.File | null,
  ) {
    const author = await this.userRepository.findOne({
      where: { id: createCommentDto.authorId },
    });

    if (!author) {
      throw new BadRequestException('Author not found');
    }
    let parent: Comment = null;
    if (createCommentDto.parent) {
      parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parent },
      });
      if (!parent) {
        throw new BadRequestException('Parent not found');
      }
    }

    const processedText = await this.validationHTML.transform(
      createCommentDto.text,
    );

    const newComment = await this.commentRepository.create({
      ...createCommentDto,
      text: processedText,
      author,
      parent,
      file: file ? await this.fileService.uploadFile(file) : null,
    });

    const savedComment = await this.commentRepository.save(newComment);

    return savedComment;
  }

  async getSortedComments(
    sortDto: SortCommentsDto = { field: 'createdAt', order: 'DESC', page: 1 },
    clientId: string,
  ) {
    const validationCache = await this.cacheService.validationSortParams(
      sortDto,
      clientId,
    );

    if (!validationCache) {
      await this.cacheService.cacheSortParams(sortDto, clientId);
    }

    const { field, order, page } = sortDto;

    const [mainComments, total] = await this.commentRepository.findAndCount({
      where: { parent: IsNull() },
      order: { [field]: order },
      skip: (page - 1) * 25,
      take: 25,
      relations: ['parent', 'answers', 'author'],
    });

    await this.returnAllNestedComments(mainComments);

    return { comments: mainComments, total };
  }

  async returnAllNestedComments(comments: Comment[]) {
    const commentMap = new Map<number, Comment>();
    comments.forEach((comment) => commentMap.set(comment.id, comment));

    const getAnswers = async (parentComment: Comment) => {
      const childComments = await this.commentRepository.find({
        where: { parent: { id: parentComment.id } },
        relations: ['parent', 'author'],
        order: { createdAt: 'DESC' },
      });

      if (childComments.length > 0) {
        parentComment.answers = childComments;
        for (const child of childComments) {
          await getAnswers(child);
        }
      }
    };

    for (const comment of comments) {
      await getAnswers(comment);
    }
  }

  async getAllComments() {
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

    return rootComments;
  }
}
