import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import { Comment } from '../entities/comment.entity';

export class CreateCommentDto {
  @IsNotEmpty()
  author: User;
  @IsString()
  @IsNotEmpty()
  text: string;

  parent: Comment | null;
}
