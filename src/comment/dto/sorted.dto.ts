import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class SortCommentsDto {
  @IsString()
  @IsOptional()
  field: string = 'createdAt';

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;
}
