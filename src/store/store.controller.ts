import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  HttpException,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreResponseDto } from './dto/store-response.dto';
import { StoreDto } from './dto/store.dto';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // GET /stores
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all stores' })
  @ApiResponse({
    status: 200,
    description: 'Successful response with a list of all stores',
    type: StoreDto,
  })
  async listAll() {
    return this.storeService.listAll();
  }

  // GET /stores/state?state=SP
  @Get('state')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get stores by state' })
  @ApiQuery({ name: 'state', description: 'State abbreviation (e.g., SP)', required: true })
  @ApiResponse({
    status: 200,
    description: 'Successful response with a list of all stores',
    type: StoreDto,
  })
  async storeByState(@Query('state') state: string) {
    if (!state) {
      throw new HttpException('State is required', HttpStatus.BAD_REQUEST);
    }
    if (state.length !== 2) {
      throw new HttpException('State must be 2 characters', HttpStatus.BAD_REQUEST);
    }
    return this.storeService.storeByState(state);
  }

   // GET /stores/:id
   @Get(':id')
   @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get store by ID' })
    @ApiParam({ name: 'id', description: 'Store ID', required: true })
    @ApiResponse({
      status: 200,
      description: 'Successful response with a list of all stores',
      type: StoreDto,
    })
   async storeById(@Param('id') id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    return this.storeService.storeById(id);
   }

   // GET /stores/cep/:cep
  @Get('cep/:cep')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get store by CEP' })
  @ApiParam({ name: 'cep', description: 'CEP (Postal Code)', required: true })
  @ApiResponse({
    status: 200,
    description: 'Successful response with store details and delivery options',
    type: StoreResponseDto,
  })
  async storeByCep(@Param('cep') cep: string) {
    if (!cep.match(/^\d{5}-?\d{3}$/)) {
      throw new HttpException('Invalid CEP', HttpStatus.BAD_REQUEST);
    }
    return this.storeService.storeByCep(cep);
  }
  // POST /stores
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiBody({ type: StoreDto })
  async createStore(@Body() createStoreDto: StoreDto) {
    return this.storeService.createStore(createStoreDto);
  }
}
