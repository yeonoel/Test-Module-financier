import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Max } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to withdraw from the bank account',
    example: 500,
    minimum: 0.01,
    maximum: 1000000,
    type: Number
  })
  @IsNumber()
  @IsPositive()
  @Max(1000000)
  amount: number;
}