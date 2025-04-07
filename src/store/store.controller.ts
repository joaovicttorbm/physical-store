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

  // GET /stores/state?state=SP
  @Get('state')
  @HttpCode(HttpStatus.OK)
  async storeByState(@Query('state') state: string) {
    if (!state) {
      return {
        message: 'State is required',
      };
    }
    if (state.length !== 2) {
      return {
        message: 'State must be 2 characters',
      };
    }
    return this.storeService.storeByState(state);
  }

   // GET /stores/:id
   @Get(':id')
   @HttpCode(HttpStatus.OK)
   async storeById(@Param('id') id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return {
        message: 'Invalid ID format',
      };
    }
    return this.storeService.storeById(id);
   }

}
