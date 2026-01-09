import { Module } from '@nestjs/common';
import { BankAccountController } from './presentation/controllers/bank-account.controller';
import { InMemoryTransactionRepository } from './infrastructure/repository/in-memory-transaction.repository';
import { SystemDateProvider } from './infrastructure/system-date.provider';
import { BankAccountService } from './application/services/bank-account.service';

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
