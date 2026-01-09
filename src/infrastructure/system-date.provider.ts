import { Injectable } from '@nestjs/common';
import { IDateProvider } from '../application/ports/date-provider.interface';

@Injectable()
export class SystemDateProvider implements IDateProvider {
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}