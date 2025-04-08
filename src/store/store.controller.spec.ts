import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('StoreController', () => {
  let controller: StoreController;
  let service: StoreService;

  const mockStoreService = {
    listAll: jest.fn(),
    storeByState: jest.fn(),
    storeById: jest.fn(),
    storeByCep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listAll', () => {
    it('should return a list of stores', async () => {
      const mockResponse = { stores: [], limit: 0, offset: 0, total: 0 };
      mockStoreService.listAll.mockResolvedValue(mockResponse);

      const result = await controller.listAll();
      expect(result).toEqual(mockResponse);
      expect(mockStoreService.listAll).toHaveBeenCalled();
    });
  });

  describe('storeByState', () => {
    it('should return stores by state', async () => {
      const mockResponse = { stores: [], limit: 0, offset: 0, total: 0 };
      mockStoreService.storeByState.mockResolvedValue(mockResponse);

      const result = await controller.storeByState('SP');
      expect(result).toEqual(mockResponse);
      expect(mockStoreService.storeByState).toHaveBeenCalledWith('SP');
    });

    it('should return an error if state is invalid', async () => {
      const result = await controller.storeByState('');
      expect(result).toEqual({ message: 'State is required' });
    });

    it('should return an error if state length is not 2', async () => {
      const result = await controller.storeByState('S');
      expect(result).toEqual({ message: 'State must be 2 characters' });
    });
  });

  describe('storeById', () => {
    it('should return a store by ID', async () => {
      const mockResponse = { stores: [], limit: 0, offset: 0, total: 0 };
      mockStoreService.storeById.mockResolvedValue(mockResponse);

      const result = await controller.storeById('60f4fe2f9c80c7fe15a5eadd');
      expect(result).toEqual(mockResponse);
      expect(mockStoreService.storeById).toHaveBeenCalledWith('60f4fe2f9c80c7fe15a5eadd');
    });

    it('should return an error if ID format is invalid', async () => {
      const result = await controller.storeById('invalid-id');
      expect(result).toEqual({ message: 'Invalid ID format' });
    });
  });

  describe('storeByCep', () => {
    it('should return stores by CEP', async () => {
      const mockResponse = { stores: [], limit: 0, offset: 0, total: 0 };
      mockStoreService.storeByCep.mockResolvedValue(mockResponse);

      const result = await controller.storeByCep('01001-000');
      expect(result).toEqual(mockResponse);
      expect(mockStoreService.storeByCep).toHaveBeenCalledWith('01001-000');
    });

    it('should throw an error if CEP is invalid', async () => {
      jest.spyOn(service, 'storeByCep').mockImplementation(() => {
        throw new HttpException('Invalid CEP', HttpStatus.BAD_REQUEST);
      });

      try {
        await controller.storeByCep('invalid-cep');
      } catch (error) {
        expect(error.response).toEqual('Invalid CEP');
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
