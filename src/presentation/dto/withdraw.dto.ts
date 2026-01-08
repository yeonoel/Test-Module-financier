import { IsNumber, IsPositive, Max } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  @Max(1000000)
  amount: number;
}