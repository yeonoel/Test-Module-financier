import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidAmountException extends HttpException {
  constructor(amount: number) {
    super(
      `Invalid amount: ${amount}. Amount must be strictly positive.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}