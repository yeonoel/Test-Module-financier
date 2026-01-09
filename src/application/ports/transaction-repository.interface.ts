import { Transaction } from '../../domain/transaction.entity';

export interface ITransactionRepository {
  save(accountId: string, transaction: Transaction): void;
  findByAccount(accountId: string): Transaction[];
  clear(accountId: string): void;
}
