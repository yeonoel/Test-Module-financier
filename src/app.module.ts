import { Module } from '@nestjs/common';
import { BankAccountController } from './presentation/bank-account.controller';
import { InMemoryTransactionRepository } from './infrastructure/in-memory-transaction.repository';
import { SystemDateProvider } from './infrastructure/system-date.provider';
import { BankAccountService } from './application/bank-account.service';

@Module({
  imports: [],
  controllers: [
    BankAccountController
  ],
  providers: [
    BankAccountService,
    {
      provide: 'ITransactionRepository', 
      useClass: InMemoryTransactionRepository
    },
    {
      provide: 'IDateProvider',
      useClass: SystemDateProvider,
    },
  ],
})
export class AppModule {}
