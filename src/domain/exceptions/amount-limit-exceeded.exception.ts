import { HttpException, HttpStatus } from '@nestjs/common';

export class AmountLimitExceededException extends HttpException {
  constructor(amount: number, limit: number = 1_000_000) {
    super(
      `Amount limit exceeded: ${amount} exceeds maximum allowed ${limit}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}