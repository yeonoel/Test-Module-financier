import { Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction.entity';

@Injectable()
export class StatementFormatterService {
  format(transactions: Transaction[]): string {
    if (transactions.length === 0) {
      return 'No transactions found.';
    }
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const header = 'Date       | Type       | Amount  | Balance';
    const separator = '-----------+------------+---------+---------';
    const rows = sortedTransactions.map((transaction) => {
      const amount = transaction.getSignedAmount();
      return `${transaction.date} | ${transaction.type.padEnd(10)} | ${amount.toString().padStart(7)} | ${transaction.balance.toString().padStart(7)}`;
    });
    return [header, separator, ...rows].join('\n');
  }
}