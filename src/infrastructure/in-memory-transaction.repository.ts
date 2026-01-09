import { Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction.entity';
import { ITransactionRepository } from '../application/ports/transaction-repository.interface';

@Injectable()
export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<string, Transaction[]> = new Map();

  save(accountId: string, transaction: Transaction): void {
    if (!this.transactions.has(accountId)) {
      this.transactions.set(accountId, []);
    }
    this.transactions.get(accountId)!.push(transaction);
  }

  findByAccount(accountId: string): Transaction[] {
    return this.transactions.get(accountId) || [];
  }

  clear(accountId: string): void {
    this.transactions.delete(accountId);
  }

  clearAll(): void {
    this.transactions.clear();
  }
}