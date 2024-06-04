import { IsOptional, IsString, IsInt, IsEmail } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text: string;
  @IsString()
  userName: string;
  @IsEmail()
  email: string;
  @IsOptional()
  parent: number | null;
  @IsString()
  homePage: string;
}
