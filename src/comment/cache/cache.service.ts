import { Inject, Injectable } from '@nestjs/common';
import { SortCommentsDto } from '../dto/sorted.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}
  async validationSortParams(sortDto: SortCommentsDto, clientId: string) {
    const cacheSortParams = await this.getSortParamsFromCache(clientId);
    if (!cacheSortParams) {
      return false;
    }
    return (
      cacheSortParams.field === sortDto.field &&
      cacheSortParams.order === sortDto.order &&
      cacheSortParams.page === sortDto.page
    );
  }

  async getSortParamsFromCache(clientId: string) {
    return await this.cacheService.get<SortCommentsDto>(
      `sortParams_${clientId}`,
    );
  }

  async cacheSortParams(sortDto: SortCommentsDto, clientId: string) {
    await this.cacheService.set(`sortParams_${clientId}`, sortDto);
  }
}
