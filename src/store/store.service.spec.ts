import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { fetchAddressFromCep } from '../common/utils/viacep.util';
import { fetchDistances } from '../common/utils/google-maps.util';
import axios from 'axios';

jest.mock('../common/utils/viacep.util', () => ({
  fetchAddressFromCep: jest.fn(),
}));

jest.mock('../common/utils/google-maps.util', () => ({
  fetchDistances: jest.fn(),
}));

describe('StoreService', () => {
  let service: StoreService;
  let storeModelMock: any;

  beforeEach(async () => {
    storeModelMock = {
      find: jest.fn(),
      findById: jest.fn(),
      save: jest.fn().mockImplementation(function () {
        return this;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getModelToken('Store'),
          useValue: storeModelMock,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listAll', () => {
    it('should return a list of stores', async () => {
      const mockStores = [{ storeName: 'Loja Exemplo' }];
      storeModelMock.find.mockResolvedValue(mockStores);

      const result = await service.listAll();
      if (result.stores.length === 0) {
        throw new NotFoundException('No stores found');
      }
      expect(result.stores).toEqual(mockStores);
      expect(storeModelMock.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no stores are found', async () => {
      storeModelMock.find.mockResolvedValue([]);
      await expect(service.listAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('storeByState', () => {
    it('should return stores by state', async () => {
      const mockStores = [{ storeName: 'Loja SP', state: 'SP' }];
      storeModelMock.find.mockResolvedValue(mockStores);

      const result = await service.storeByState('SP');
      if (result.stores.length === 0) {
        throw new NotFoundException('No stores found');
      }
      expect(result.stores).toEqual(mockStores);
      expect(storeModelMock.find).toHaveBeenCalledWith({ state: 'SP' });
    });

    it('should throw NotFoundException if no stores are found in the state', async () => {
      storeModelMock.find.mockResolvedValue([]);
      await expect(service.storeByState('SP')).rejects.toThrow(NotFoundException);
    });
  });

  describe('storeById', () => {
    it('should return a store by ID', async () => {
      const mockStore = {
        storeName: 'Loja Exemplo',
        address1: 'Rua Exemplo',
        address2: undefined,
        address3: undefined,
        city: 'São Paulo',
        district: 'Centro',
        state: 'SP',
        postalCode: '01001-000',
        country: 'Brasil',
        latitude: '-23.5503099',
        longitude: '-46.6342009',
        takeOutInStore: true,
        shippingTimeInDays: 2,
        telephoneNumber: '123456789',
        emailAddress: 'store@example.com',
        type: 'LOJA',
      };
      storeModelMock.findById.mockResolvedValue(mockStore);

      const result = await service.storeById('60f4fe2f9c80c7fe15a5eadd');

      expect(result).toEqual({
        stores: [mockStore],
      });
      expect(storeModelMock.findById).toHaveBeenCalledWith('60f4fe2f9c80c7fe15a5eadd');
    });

    it('should throw HttpException if store is not found', async () => {
      storeModelMock.findById.mockResolvedValue(null);
      await expect(service.storeById('60f4fe2f9c80c7fe15a5eadd')).rejects.toThrow(HttpException);
    });
  });

  describe('storeByCep', () => {
    it('should return stores by CEP', async () => {
      const mockViaCepData = { logradouro: 'Rua Exemplo', localidade: 'São Paulo', uf: 'SP' };
      const mockStores = [{ latitude: '-23.5503099', longitude: '-46.6342009', storeName: 'Loja Exemplo' }];
      const mockDistanceData = {
        rows: [
          {
            elements: [{ status: 'OK', distance: { text: '1 km', value: 1000 } }],
          },
        ],
      };

      (fetchAddressFromCep as jest.Mock).mockResolvedValue(mockViaCepData);
      (fetchDistances as jest.Mock).mockResolvedValue(mockDistanceData);
      storeModelMock.find.mockResolvedValue(mockStores);

      const result = await service.storeByCep('01001-000');
      expect(result.stores[0].name).toEqual('Loja Exemplo');
      expect(fetchAddressFromCep).toHaveBeenCalledWith('01001-000');
      expect(fetchDistances).toHaveBeenCalled();
    });

    it('should throw HttpException if no stores are found', async () => {
      const mockViaCepData = { logradouro: 'Rua Exemplo', localidade: 'São Paulo', uf: 'SP' };
      (fetchAddressFromCep as jest.Mock).mockResolvedValue(mockViaCepData);
      storeModelMock.find.mockResolvedValue([]);

      await expect(service.storeByCep('01001-000')).rejects.toThrow(HttpException);
    });
  });
});

const mockViaCepData = { logradouro: 'Rua Exemplo', localidade: 'São Paulo', uf: 'SP' };
(fetchAddressFromCep as jest.Mock).mockResolvedValue(mockViaCepData);


