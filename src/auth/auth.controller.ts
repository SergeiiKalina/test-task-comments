import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: AuthService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    return this.userService.login(createUserDto);
  }
}
