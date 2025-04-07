import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema';
import { CreateStoreDto } from './dto/create-store.dto';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}
  async listAll(): Promise<any> {
    const stores = await this.storeModel.find();
    if (stores.length === 0) {
      throw new NotFoundException('No stores found');
    }
    return {
      stores,
      limit: stores.length,
      offset: 0,
      total: stores.length,
    };
  }
  async storeByState(state: string): Promise<any> {
    const stores = await this.storeModel.find({ state: state.toUpperCase() });
    if (stores.length === 0) {
      throw new NotFoundException(`No stores found in state: ${state}`);
    }
    return {
      stores,
      limit: stores.length,
      offset: 0,
      total: stores.length,
    };
  }
  async storeById(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id);
    if (!store) {
      throw new HttpException('Store not found', HttpStatus.NOT_FOUND);
    }
    return store;
  }

  
}
