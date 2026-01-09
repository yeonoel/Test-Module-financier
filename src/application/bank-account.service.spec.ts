import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountService } from './bank-account.service';
import { InMemoryTransactionRepository } from '../infrastructure/in-memory-transaction.repository';
import { IDateProvider } from './ports/date-provider.interface';
import { InvalidAmountException } from '../domain/exceptions/invalid-amount.exception';
import { InsufficientFundsException } from '../domain/exceptions/insufficient-funds.exception';
import { AmountLimitExceededException } from '../domain/exceptions/amount-limit-exceeded.exception';

describe('BankAccountService', () => {
  let service: BankAccountService;
  let repository: InMemoryTransactionRepository;
  let dateProvider: IDateProvider;

  beforeEach(async () => {
    repository = new InMemoryTransactionRepository();
    dateProvider = {
      getCurrentDate: jest.fn().mockReturnValue('2024-01-09'),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountService,
        {
          provide: 'ITransactionRepository',
          useValue: repository,
        },
        {
          provide: 'IDateProvider',
          useValue: dateProvider,
        },
      ],
    }).compile();
    service = module.get<BankAccountService>(BankAccountService);
  });

  afterEach(() => {
    repository.clearAll();
  });

  describe('deposit', () => {
    it('should successfully deposit a valid amount and update balance', () => {
      // Arrange - Act
      service.deposit(1000);
      const transactions = repository.findByAccount('default');
      // Assert
      expect(service.getCurrentBalance()).toBe(1000);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(1000);
      expect(transactions[0].balance).toBe(1000);
    });

    it('should throw InvalidAmountException when deposit amount is zero', () => {
      expect(() => service.deposit(0)).toThrow(InvalidAmountException);
      expect(() => service.deposit(0)).toThrow('Invalid amount: 0. Amount must be strictly positive.');
    });

    it('should throw InvalidAmountException when deposit amount is negative', () => {
      expect(() => service.deposit(-500)).toThrow(InvalidAmountException);
      expect(() => service.deposit(-500)).toThrow('Invalid amount: -500. Amount must be strictly positive.');
    });

    it('should throw AmountLimitExceededException when deposit exceeds limit', () => {
      expect(() => service.deposit(1_000_001)).toThrow(AmountLimitExceededException);
      expect(() => service.deposit(1_000_001)).toThrow('Amount limit exceeded: 1000001 exceeds maximum allowed 1000000.');
    });

    it('should correctly cumulate multiple deposits', () => {
      service.deposit(1000);
      service.deposit(500);
      service.deposit(250);
      expect(service.getCurrentBalance()).toBe(1750);
      const transactions = repository.findByAccount('default');
      expect(transactions).toHaveLength(3);
      expect(transactions[2].balance).toBe(1750);
    });
  });

  describe('withdraw', () => {
    beforeEach(() => {
      service.deposit(1000);
    });

    it('should successfully withdraw a valid amount with sufficient balance', () => {
      service.withdraw(500);
      expect(service.getCurrentBalance()).toBe(500);
      const transactions = repository.findByAccount('default');
      expect(transactions).toHaveLength(2);
      expect(transactions[1].amount).toBe(500);
      expect(transactions[1].balance).toBe(500);
    });

    it('should throw InvalidAmountException when withdraw amount is zero', () => {
      expect(() => service.withdraw(0)).toThrow(InvalidAmountException);
    });

    it('should throw InvalidAmountException when withdraw amount is negative', () => {
      expect(() => service.withdraw(-200)).toThrow(InvalidAmountException);
    });

    it('should throw InsufficientFundsException when withdrawal exceeds balance', () => {
      expect(() => service.withdraw(1500)).toThrow(InsufficientFundsException);
      expect(() => service.withdraw(1500)).toThrow('Insufficient funds: Cannot withdraw 1500 with balance 1000.');
    });

    it('should successfully withdraw amount equal to balance (edge case)', () => {
      service.withdraw(1000);

      expect(service.getCurrentBalance()).toBe(0);
      const transactions = repository.findByAccount('default');
      expect(transactions[1].balance).toBe(0);
    });

    it('should throw AmountLimitExceededException when withdrawal exceeds limit', () => {
      service.deposit(1_000_000);
      expect(() => service.withdraw(1_000_001)).toThrow(AmountLimitExceededException);
    });
  });

  describe('printStatement', () => {
    it('should print no transactions found when account is empty', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.printStatement();
      expect(consoleSpy).toHaveBeenCalledWith('No transactions found.');
      consoleSpy.mockRestore();
    });

    it('should print correctly formatted statement for single transaction', () => {
      service.deposit(1000);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.printStatement();
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Date       | Type       | Amount  | Balance');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '-----------+------------+---------+---------');
      expect(consoleSpy).toHaveBeenNthCalledWith(3, '2024-01-09 | DEPOSIT    |    1000 |    1000');
      consoleSpy.mockRestore();
    });

    it('should print transactions in descending chronological order', () => {
      (dateProvider.getCurrentDate as jest.Mock)
        .mockReturnValueOnce('2024-01-04')
        .mockReturnValueOnce('2024-01-08')
        .mockReturnValueOnce('2024-01-09');

      service.deposit(1000);
      service.deposit(2000);
      service.withdraw(500);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.printStatement();

      expect(consoleSpy).toHaveBeenNthCalledWith(3, '2024-01-09 | WITHDRAWAL |    -500 |    2500');
      expect(consoleSpy).toHaveBeenNthCalledWith(4, '2024-01-08 | DEPOSIT    |    2000 |    3000');
      expect(consoleSpy).toHaveBeenNthCalledWith(5, '2024-01-04 | DEPOSIT    |    1000 |    1000');
      consoleSpy.mockRestore();
    });

    it('should display cumulative balance correctly after each operation', () => {
      service.deposit(1000);
      service.deposit(500);
      service.withdraw(200);
      const transactions = repository.findByAccount('default');
      expect(transactions[0].balance).toBe(1000);
      expect(transactions[1].balance).toBe(1500);
      expect(transactions[2].balance).toBe(1300);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: deposit → withdraw → deposit → statement', () => {
      (dateProvider.getCurrentDate as jest.Mock)
        .mockReturnValueOnce('2024-01-04')
        .mockReturnValueOnce('2024-01-08')
        .mockReturnValueOnce('2024-01-09');

      service.deposit(1000);
      expect(service.getCurrentBalance()).toBe(1000);
      service.withdraw(500);
      expect(service.getCurrentBalance()).toBe(500);
      service.deposit(2000);
      expect(service.getCurrentBalance()).toBe(2500);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.printStatement();
      const transactions = repository.findByAccount('default');
      expect(transactions).toHaveLength(3);
      expect(consoleSpy).toHaveBeenCalledTimes(5);
      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentBalance', () => {
    it('should return 0 when no transactions', () => {
      expect(service.getCurrentBalance()).toBe(0);
    });

    it('should return current balance after operations', () => {
      service.deposit(1000);
      expect(service.getCurrentBalance()).toBe(1000);
      
      service.withdraw(300);
      expect(service.getCurrentBalance()).toBe(700);
    });
  });
});