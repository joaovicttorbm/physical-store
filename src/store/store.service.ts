import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const fullAddress = `${createStoreDto.address1}, ${createStoreDto.address2}, ${createStoreDto.city}, ${createStoreDto.state}, ${createStoreDto.postalCode}`;
    const { lat, lng } = await this.getCoordinatesFromAddress(fullAddress);

    const createdStore = new this.storeModel({
      ...createStoreDto,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    return createdStore.save();
  }

  async findAll(): Promise<Store[]> {
    return this.storeModel.find().exec();
  }

  async findNearbyStoresByCep(cep: string): Promise<any[]> {
    const stores = await this.storeModel.find().exec();

    if (stores.length === 0) {
      throw new NotFoundException('Nenhuma loja cadastrada no sistema.');
    }

    const storesWithDistances = await this.getDistancesFromCepToStores(cep, stores);

    const nearbyStores = storesWithDistances
      .filter(store => store.distance <= 100)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyStores.length === 0) {
      throw new NotFoundException('Nenhuma loja encontrada num raio de 100km deste CEP.');
    }

    return nearbyStores;
  }

  private async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: apiKey,
        },
      },
    );

    if (
      response.data.status !== 'OK' ||
      !response.data.results ||
      response.data.results.length === 0
    ) {
      throw new NotFoundException('Endereço/CEP não encontrado na API do Google Maps.');
    }

    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }

  private async getDistancesFromCepToStores(cep: string, stores: Store[]): Promise<any[]> {
    console.log('getDistancesFromCepToStores:');
    console.log('CEP:', cep);

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API Key:', apiKey);
    const destinations = stores
      .map(store => `${store.latitude},${store.longitude}`)
      .join('|');

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: cep,
          destinations,
          key: apiKey,
          units: 'metric',
        },
      },
    );
    console.log('Resposta da API do Google Maps:', response);

    if (response.data.status !== 'OK') {
      console.error('Erro na API do Google Maps:', response.data.error_message);
      throw new NotFoundException('Erro ao buscar distâncias na API do Google Maps.');
    }

    const distances = response.data.rows[0].elements;

    return stores.map((store, index) => {
      const element = distances[index];
      return {
        ...store,
        distance: element.distance.value / 1000, // metros -> km
        distanceText: element.distance.text,
        durationText: element.duration.text,
      };
    });
  }
}
