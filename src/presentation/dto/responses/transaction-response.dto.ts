import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ example: '123' })
  accountId: string;

  @ApiProperty({ example: 1500 })
  newBalance: number;

  @ApiProperty({ example: 'uuid-string' })
  transactionId: string;
}

export class StatementTransactionDto {
  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ example: 'DEPOSIT' })
  type: string;

  @ApiProperty({ example: 1000 })
  amount: number;

  @ApiProperty({ example: 1000 })
  balance: number;
}

export class StatementResponseDto {
  @ApiProperty({ example: '123' })
  accountId: string;

  @ApiProperty({ type: [StatementTransactionDto] })
  transactions: StatementTransactionDto[];
}
