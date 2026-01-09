import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import  request from 'supertest';
import { AppModule } from '../src/app.module';
import { InMemoryTransactionRepository } from '../src/infrastructure/repository/in-memory-transaction.repository';

describe('BankAccountController (e2e)', () => {
  let app: INestApplication;
  let repository: InMemoryTransactionRepository;

  beforeEach(async () => {
    repository = new InMemoryTransactionRepository();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
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

  afterEach(async () => {
    repository.clearAll();
  });

  describe('/accounts/deposit (POST)', () => {
    it('should successfully deposit money', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 1000 })
        .expect(200);
      expect(response.body).toEqual({
        accountId: 'default',
        newBalance: 1000,
      });
    });

    it('should reject deposit with negative amount', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: -500 })
        .expect(400);
    });

    it('should reject deposit with zero amount', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 0 })
        .expect(400);
    });

    it('should reject deposit exceeding limit (1,000,000)', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 1_000_001 })
        .expect(400);
    });

    it('should handle multiple deposits correctly', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 1000 })
        .expect(200);

      const response = await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 500 })
        .expect(200);

      expect(response.body.newBalance).toBe(1500);
    });
  });

  describe('/accounts/withdraw', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 1000 });
    });

    it('should successfully withdraw money', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 500 })
        .expect(200);

      expect(response.body).toEqual({accountId: 'default', newBalance: 500});
    });

    it('should reject withdrawal with insufficient funds', async () => {
      await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 2000 })
        .expect(400);
    });

    it('should reject withdrawal with negative amount', async () => {
      await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: -100 })
        .expect(400);
    });

    it('should reject withdrawal exceeding limit', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 2_000_000 });

      await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 1_000_001 })
        .expect(400);
    });

    it('should allow withdrawal of entire balance', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 1000 })
        .expect(200);

      expect(response.body.newBalance).toBe(0);
    });
  });

  describe('/accounts/statement (GET)', () => {
    it('should call printStatement method', async () => {
      await request(app.getHttpServer())
        .get('/accounts/statement')
        .expect(200);
    });

    it('should work after transactions', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 1000 });

      await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 300 });

      await request(app.getHttpServer())
        .get('/accounts/statement')
        .expect(200);
    });
  });

  describe('Validation tests', () => {
    it('should reject deposit without amount field', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({})
        .expect(400);
    });

    it('should reject deposit with non-number amount', async () => {
      await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: '100' })
        .expect(400);
    });

    it('should reject withdraw without amount field', async () => {
      await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({})
        .expect(400);
    });
  });

  // Tests d'intégration complets
  describe('Complete workflow integration', () => {
    it('should handle deposit → withdraw → statement flow', async () => {
      const deposit1 = await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 2000 })
        .expect(200);
      expect(deposit1.body.newBalance).toBe(2000);

      const withdraw1 = await request(app.getHttpServer())
        .post('/accounts/withdraw')
        .send({ amount: 800 })
        .expect(200);
      expect(withdraw1.body.newBalance).toBe(1200);

      const deposit2 = await request(app.getHttpServer())
        .post('/accounts/deposit')
        .send({ amount: 500 })
        .expect(200);
      expect(deposit2.body.newBalance).toBe(1700);

      await request(app.getHttpServer())
        .get('/accounts/statement')
        .expect(200);
    });
  });
});