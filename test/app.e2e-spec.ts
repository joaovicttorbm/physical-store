import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('StoreController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Insere uma loja no banco de dados para os testes
    await request(app.getHttpServer())
      .post('/stores')
      .send({
        _id: '60f4fe2f9c80c7fe15a5eadd',
        storeName: 'Loja Exemplo',
        address1: 'Rua Exemplo',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01001-000',
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/stores (GET)', () => {
    it('should return a list of stores', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(response.body).toHaveProperty('stores');
      expect(response.body.stores).toEqual(expect.any(Array));
    });

    it('should return message if state is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/state?state=invalid')
              expect(response.body.message).toEqual('State must be 2 characters');
    });
  });

  describe('/stores/cep/:cep (GET)', () => {
    it('should return stores by CEP', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/cep/01001-000')
        .expect(200);

      expect(response.body).toHaveProperty('stores');
      expect(response.body.stores).toEqual(expect.any(Array));
    });

    it('should return 400 for an invalid CEP', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/cep/invalid-cep')
        .expect(400);

      expect(response.body.message).toEqual('Invalid CEP');
    });
  });

  describe('/stores/:id (GET)', () => {


    it('should return message if invalid ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/invalid-id')
              expect(response.body.message).toEqual('Invalid ID format');
    });
  });
});
