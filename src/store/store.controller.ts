import { Controller, Post, Body, Get, Query, NotFoundException } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { SearchStoreDto } from './dto/search-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Get('nearby')
  async findNearby(@Query() query: SearchStoreDto) {
    console.log('CEP recebido:', query.cep);
    if (!query.cep) {
      throw new NotFoundException('O parâmetro "cep" é obrigatório.');
    }

    const stores = await this.storeService.findNearbyStoresByCep(query.cep);

    if (!stores.length) {
      return { message: 'Nenhuma loja encontrada em um raio de 100km.' };
    }

    return stores;
  }
}
