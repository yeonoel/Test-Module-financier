import { IsNumber, IsPositive, Max } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsPositive()
  @Max(1000000)
  amount: number;
}