import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // GET /stores
  @Get()
  @HttpCode(HttpStatus.OK)
  async listAll() {
    return this.storeService.listAll();
  }

}
