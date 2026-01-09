import { Injectable, Inject } from '@nestjs/common';
import { BankAccount } from '../../domain/interfaces/bank-account.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InvalidAmountException } from '../../domain/exceptions/invalid-amount.exception';
import { InsufficientFundsException } from '../../domain/exceptions/insufficient-funds.exception';
import { AmountLimitExceededException } from '../../domain/exceptions/amount-limit-exceeded.exception';
import type { ITransactionRepository } from '../ports/transaction-repository.interface';
import type { IDateProvider } from '../ports/date-provider.interface';

@Injectable()
export class BankAccountService implements BankAccount {
  private readonly MAX_AMOUNT = 1_000_000;
  private readonly accountId: string = 'default';

  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IDateProvider')
    private readonly dateProvider: IDateProvider
  ) {}

  deposit(amount: number): void {
    this.validateAmount(amount);
    this.checkAmountLimit(amount);
    const currentBalance = this.calculateBalance();
    const newBalance = currentBalance + amount;
    const transaction = new Transaction(
      this.dateProvider.getCurrentDate(),
      TransactionType.DEPOSIT,
      amount,
      newBalance,
    );
    this.transactionRepository.save(this.accountId, transaction);
  }

  withdraw(amount: number): void {
    this.validateAmount(amount);
    this.checkAmountLimit(amount);
    const currentBalance = this.calculateBalance();
    if (amount > currentBalance) {
      throw new InsufficientFundsException(amount, currentBalance);
    }
    const newBalance = currentBalance - amount;
    const transaction = new Transaction(
      this.dateProvider.getCurrentDate(),
      TransactionType.WITHDRAWAL,
      amount,
      newBalance,
    );

    this.transactionRepository.save(this.accountId, transaction);
  }

  printStatement(): void {
    const transactions = this.transactionRepository.findByAccount(this.accountId);
    if (transactions.length === 0) {
      console.log('No transactions found.');
      return;
    }
    // Trier du plus récent au plus ancien
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    console.log('Date       | Type       | Amount  | Balance');
    console.log('-----------+------------+---------+---------');
    sortedTransactions.forEach((transaction) => {
      const amount = transaction.getSignedAmount();
      console.log(
        `${transaction.date} | ${transaction.type.padEnd(10)} | ${amount.toString().padStart(7)} | ${transaction.balance.toString().padStart(7)}`,
      );
    });
  }

  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new InvalidAmountException(amount);
    }
  }

  private checkAmountLimit(amount: number): void {
    if (amount > this.MAX_AMOUNT) {
      throw new AmountLimitExceededException(amount, this.MAX_AMOUNT);
    }
  }

  private calculateBalance(): number {
    const transactions = this.transactionRepository.findByAccount(this.accountId);
    if (transactions.length === 0) {
      return 0;
    }
    return transactions[transactions.length - 1].balance;
  }

  // utilisé surtout pour les tests
  getCurrentBalance(): number {
    return this.calculateBalance();
  }
}