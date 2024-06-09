import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (user) {
      throw new BadRequestException('This email is already in use');
    }
    const newUser = await this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return {
      ...newUser,
      token: await this.jwtService.signAsync(
        { ...newUser },
        {
          expiresIn: '1d',
          secret: this.configService.get('JWT_SECRET'),
        },
      ),
    };
  }

  async login(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    return {
      ...user,
      token: await this.jwtService.signAsync(
        { ...user },
        {
          expiresIn: '1d',
          secret: this.configService.get('JWT_SECRET'),
        },
      ),
    };
  }
}
