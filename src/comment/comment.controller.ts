import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RecaptchaGuard } from './guard/captcha.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from './pipes/sharp.pipe';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  // @UseGuards(RecaptchaGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(SharpPipe)
    file: Express.Multer.File,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    console.log(file);
    return this.commentService.create(createCommentDto);
  }
}
