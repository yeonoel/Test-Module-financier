import {Controller, Post, Get, Body, HttpCode, HttpStatus} from '@nestjs/common';
import {ApiTags, ApiOperation} from '@nestjs/swagger';
import { BankAccountService } from '../application/bank-account.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionResponseDto } from './dto/responses/transaction-response.dto';

@ApiTags('Bank Account')
@Controller('accounts')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit money into account' })
  deposit(@Body() depositDto: DepositDto): TransactionResponseDto {
    this.bankAccountService.deposit(depositDto.amount);

    return {
      accountId: 'default',
      newBalance: this.bankAccountService.getCurrentBalance(),
    };
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw money from account' })
  withdraw(@Body() withdrawDto: WithdrawDto): TransactionResponseDto {
    this.bankAccountService.withdraw(withdrawDto.amount);

    return {
      accountId: 'default',
      newBalance: this.bankAccountService.getCurrentBalance(),
    };
  }

  @ApiOperation({ summary: 'Get account statement' })
  @Get('statement')
  getStatement(): void {
    this.bankAccountService.printStatement();
  }
}