import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientFundsException extends HttpException {
  constructor(requestedAmount: number, availableBalance: number) {
    super(
      `Insufficient funds: Cannot withdraw ${requestedAmount} with balance ${availableBalance}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}