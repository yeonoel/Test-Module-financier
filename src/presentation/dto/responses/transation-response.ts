// transaction-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ example: 'default' })
  accountId: string;

  @ApiProperty({ example: 1000 })
  newBalance: number;
}