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
  private readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
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

  /**
   * Retrieves a list of stores and their respective delivery options based on a given CEP (postal code).
   * 
   * This method performs the following steps:
   * 1. Fetches address details from the ViaCEP API using the provided CEP.
   * 2. Retrieves all stores from the database.
   * 3. Calculates the distance between the provided CEP and each store using the Google Maps Distance Matrix API.
   * 4. Constructs a response containing store details, delivery options, and map pins.
   * 
   * @param cep - The postal code (CEP) to search for nearby stores.
   * @returns A promise that resolves to an object containing:
   * - `stores`: An array of store details, including name, city, postal code, type, distance, and delivery options.
   * - `pins`: An array of map pin objects with store coordinates and titles.
   * - `limit`: The number of stores in the result.
   * - `offset`: The starting index of the result (always 0 in this case).
   * - `total`: The total number of stores in the result.
   * 
   * @throws {HttpException} If the CEP is invalid, the APIs fail, or any other error occurs during processing.
   */
  async storeByCep(cep: string): Promise<any> {
    try {
      const viaCepUrl = `https://viacep.com.br/ws/${cep}/json/`;
      const { data: viaCepData } = await axios.get(viaCepUrl);

      if (viaCepData.erro) {
        throw new Error('CEP inválido');
      }
      
      const stores = await this.storeModel.find();
      if (stores.length === 0) {
        throw new NotFoundException('No stores found');
      }

      const origins = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}`;
      const destinations = stores.map(
        (store) => `${store.latitude},${store.longitude}`,
      );

      const mapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origins,
      )}&destinations=${encodeURIComponent(
        destinations.join('|'),
      )}&key=${this.GOOGLE_MAPS_API_KEY}&language=pt-BR&units=metric`;

      const { data: distanceData } = await axios.get(mapsUrl);
      if (distanceData.status !== 'OK') {
        throw new Error('Erro ao calcular distâncias');
      }
      const results = [];
      const pins = [];

      for (let i = 0; i < stores.length; i++) {
        const element = distanceData.rows[0].elements[i];
        const store = stores[i];

        if (element.status !== 'OK') continue;

        const distanceKm = element.distance.value / 1000;
        const distanceText = element.distance.text;

        let storeResult: any = {
          name: store.storeName,
          city: store.city,
          postalCode: store.postalCode,
          type: store.type,
          distance: distanceText,
          value: [],
        };

        if (store.type === 'PDV') {
          if (distanceKm <= 50) {
            storeResult.value.push({
              prazo: `${store.shippingTimeInDays} dias úteis`,
              price: 'R$ 15,00',
              description: 'Motoboy',
            });
          } else {
            continue; // PDV fora do raio de entrega
          }
        } else if (store.type === 'LOJA') {
          // Chamada à API dos Correios para calcular frete
          // Exemplo fictício para evitar bloqueio (real: usar WebService ou alternativa)
          storeResult.value = [
            {
              prazo: '2 dias úteis',
              codProdutoAgencia: '04014',
              price: 'R$ 27,00',
              description: 'Sedex a encomenda expressa dos Correios',
            },
            {
              prazo: '6 dias úteis',
              codProdutoAgencia: '04510',
              price: 'R$ 25,50',
              description: 'PAC a encomenda economica dos Correios',
            },
          ];
        }

        results.push(storeResult);

        pins.push({
          position: {
            lat: store.latitude,
            lng: store.longitude,
          },
          title: store.storeName,
        });
      }

      return {
        stores: results,
        pins,
        limit: results.length,
        offset: 0,
        total: results.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar lojas por CEP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
