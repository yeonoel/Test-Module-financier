import {Controller, Post, Get, Body, HttpCode, HttpStatus} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';
import { BankAccountService } from '../../application/services/bank-account.service';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransactionResponseDto } from '../dto/responses/transation-response';


@ApiTags('Bank Account')
@Controller('accounts')
export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit money into account' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deposit successful',
    type: TransactionResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid amount or limit exceeded' 
  })
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
  @ApiResponse({ 
    status: 200, 
    description: 'Success',
    type: TransactionResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request (invalid amount or insufficient funds)' 
  })
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