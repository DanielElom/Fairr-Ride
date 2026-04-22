import { IsString } from 'class-validator';

export class CashConfirmDto {
  @IsString()
  orderId: string;
}
