import { IsEmail, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsOptional()
  @IsUrl()
  homePage: string;
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'User Name can only contain letters and numbers',
  })
  userName: string;
}
