import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

const request = require('supertest');

describe('BankAccountController (e2e)', () => {
  let app: INestApplication;
  const accountId = 'e2e-test-account';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/accounts/:id/deposit (POST)', () => {
    it('should successfully deposit money', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ amount: 1000 })
        .expect(200)
        .expect((res) => {
          expect(res.body.accountId).toBe(accountId);
          expect(res.body.newBalance).toBe(1000);
          expect(res.body.transactionId).toBeDefined();
        });
    });

    it('should reject negative amount', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ amount: -500 })
        .expect(400);
    });

    it('should reject amount exceeding limit', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ amount: 1_500_000 })
        .expect(400);
    });
  });

  describe('/accounts/:id/withdraw (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ amount: 1000 });
    });

    it('should successfully withdraw money', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ amount: 500 })
        .expect(200)
        .expect((res) => {
          expect(res.body.newBalance).toBe(500);
        });
    });

    it('should reject withdrawal exceeding balance', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ amount: 2000 })
        .expect(400);
    });
  });

  describe('/accounts/:id/statement (GET)', () => {
    it('should return empty statement for new account', () => {
      return request(app.getHttpServer())
        .get(`/accounts/new-account/statement`)
        .expect(200)
        .expect((res) => {
          expect(res.body.transactions).toEqual([]);
        });
    });

    it('should return transactions in descending order', async () => {
      await request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ amount: 1000 });

      await request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ amount: 500 });

      return request(app.getHttpServer())
        .get(`/accounts/${accountId}/statement`)
        .expect(200)
        .expect((res) => {
          expect(res.body.transactions.length).toBeGreaterThan(0);
          expect(res.body.transactions[0].type).toBe('WITHDRAWAL');
        });
    });
  });
});