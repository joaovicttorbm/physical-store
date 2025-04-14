import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from './schemas/store.schema';
import { StoreDto } from './dto/store.dto';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fetchAddressFromCep } from '../common/utils/viacep.util';
import { fetchDistances } from '../common/utils/google-maps.util';
import { buildResponse } from './mappers/store.mapper';
import { mapStoreWithDistance } from './mappers/store-by-cep.mapper';
import { getDeliveryOptions } from '../common/utils/delivery-options.util';

dotenv.config();

@Injectable()
export class StoreService {
  private readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ;
  
  constructor(
    @InjectModel('Store') private storeModel: Model<Store>,
  ) {}
  
  
  async listAll(): Promise<any> {
    const stores = await this.storeModel.find();
    if (stores.length === 0) {
      throw new NotFoundException('No stores found');
    }
    return buildResponse(stores);
  }
  async storeByState(state: string): Promise<any> {
    const stores = await this.storeModel.find({ state: state.toUpperCase() });
    if (stores.length === 0) {
      throw new NotFoundException(`No stores found in state: ${state}`);
    }
    return buildResponse(stores);
  }
  async storeById(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id);
    if (!store) {
      throw new HttpException('Store not found', HttpStatus.NOT_FOUND);
    }
    return buildResponse([store]);
  }

  async storeByCep(cep: string): Promise<any> {
    try {
      const viaCepData = await fetchAddressFromCep(cep);
      const stores = await this.storeModel.find();
      if (stores.length === 0) {
        throw new NotFoundException('No stores found');
      }
  
      const origins = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}`;
      const destinations = stores.map(
        (store) => `${store.latitude},${store.longitude}`,
      );
  
      const distanceData = await fetchDistances(
        origins,
        destinations,
        this.GOOGLE_MAPS_API_KEY,
      );
  
      const results = await Promise.all(
        stores.map(async (store, i) => {
          const element = distanceData.rows[0].elements[i];
          if (element.status !== 'OK') return null;
  
          const distanceKm = element.distance.value / 1000;
          // limit the distance to 100 km
          // if (distanceKm > 100) return null;
          
          const deliveryOptions = await getDeliveryOptions(
            store,
            cep,
            distanceKm,
            process.env.MELHOR_ENVIO_API_KEY, 
          );
  
          return mapStoreWithDistance(store, element.distance.text, deliveryOptions);
        }),
      );
      // limit the distance to 100 km
      // const filteredResults = results.filter(Boolean).sort
      const filteredResults = results.sort((a, b) => {
        if (a.type === 'PDV' && b.type !== 'PDV') return -1;
        if (a.type !== 'PDV' && b.type === 'PDV') return 1;
  
        const distanceA = parseFloat(a.distance.replace(/[^\d.,]/g, '').replace(',', '.'));
        const distanceB = parseFloat(b.distance.replace(/[^\d.,]/g, '').replace(',', '.'));
        return distanceA - distanceB;
      });
      if (filteredResults.length === 0) {
        throw new NotFoundException('No stores found within 100 km radius');
      }
  
      return {
        stores: filteredResults,
        total: filteredResults.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar lojas por CEP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createStore(dto: StoreDto): Promise<Store> {
    try {
      const viaCepUrl = `https://viacep.com.br/ws/${dto.postalCode}/json/`;
      const { data: viaCepData } = await axios.get(viaCepUrl);
  
      if (viaCepData.erro) {
        throw new HttpException('Invalid CEP', HttpStatus.BAD_REQUEST);
      }

      const address = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}`;
            
      const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${this.GOOGLE_MAPS_API_KEY}`;
      const { data: mapsData } = await axios.get(mapsUrl);
  
      if (mapsData.status !== 'OK' || mapsData.results.length === 0) {
        throw new HttpException('Unable to fetch coordinates', HttpStatus.BAD_REQUEST);
      }
  
      const location = mapsData.results[0].geometry.location;
  
      dto.latitude = location.lat.toString();
      dto.longitude = location.lng.toString();
  
      const newStore = new this.storeModel(dto);
      return await newStore.save();
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || error.message || 'Error creating store',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
