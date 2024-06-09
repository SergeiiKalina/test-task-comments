import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text: string;

  @IsOptional()
  parent: number | null;

  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @IsString()
  @IsOptional()
  userName: string;

  @IsString()
  @IsOptional()
  homePage: string;
  @IsString()
  @IsOptional()
  email: string;
}
