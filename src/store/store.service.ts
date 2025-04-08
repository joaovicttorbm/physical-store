import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from './schemas/store.schema';
import { CreateStoreDto } from './dto/create-store.dto';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class StoreService {
  private readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
  constructor(
    @InjectModel('Store') private storeModel: Model<Store>,
  ) {}
  private formatStore(store: Store): any {
    return {
      storeID: store._id,
      storeName: store.storeName,
      takeOutInStore: store.takeOutInStore,
      shippingTimeInDays: store.shippingTimeInDays,
      latitude: store.latitude,
      longitude: store.longitude,
      address1: store.address1,
      address2: store.address2,
      address3: store.address3,
      city: store.city,
      district: store.district,
      state: store.state,
      type: store.type,
      country: store.country,
      postalCode: store.postalCode,
      telephoneNumber: store.telephoneNumber,
      emailAddress: store.emailAddress,
    };
  }
  private buildResponse(stores: Store[]): any {
    const formattedStores = stores.map((store) => this.formatStore(store));
    return {
      stores: formattedStores,
      limit: stores.length,
      offset: 0,
      total: stores.length,
    };
  }
  async listAll(): Promise<any> {
    const stores = await this.storeModel.find();
    if (stores.length === 0) {
      throw new NotFoundException('No stores found');
    }
    return this.buildResponse(stores);
  }
  async storeByState(state: string): Promise<any> {
    const stores = await this.storeModel.find({ state: state.toUpperCase() });
    if (stores.length === 0) {
      throw new NotFoundException(`No stores found in state: ${state}`);
    }
    return this.buildResponse(stores);
  }
  async storeById(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id);
    if (!store) {
      throw new HttpException('Store not found', HttpStatus.NOT_FOUND);
    }
    return this.buildResponse([store]);
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

      const results = stores.map((store, i) => {
        const element = distanceData.rows[0].elements[i];
        if (element.status !== 'OK') return null;

        const distanceKm = element.distance.value / 1000;
        const distanceText = element.distance.text;

        const value = [];
        if (store.type === 'PDV' && distanceKm <= 50) {
          value.push({
        prazo: '1 dias úteis',
        price: 'R$ 15,00',
        description: 'Motoboy',
          });
        } else if (store.type === 'LOJA') {
          value.push(
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
          );
        }

        return {
          name: store.storeName,
          city: store.city,
          postalCode: store.postalCode,
          type: store.type,
          distance: distanceText,
          value,
        };
      }).filter(Boolean);

      const pins = stores.map((store) => ({
        position: {
          lat: store.latitude,
          lng: store.longitude,
        },
        title: store.storeName,
      }));

      return {
        stores: results,
        pins,
        limit: 1,
        offset: 1,
        total: 100,
      };
        } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar lojas por CEP',
        HttpStatus.BAD_REQUEST,
      );
        }
  }

  async createStore(dto: CreateStoreDto): Promise<Store> {
    const newStore = new this.storeModel(dto);
    return await newStore.save();
  }
}
