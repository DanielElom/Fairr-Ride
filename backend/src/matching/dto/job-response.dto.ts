import { IsString } from 'class-validator';

export class JobResponseDto {
  @IsString()
  orderId: string;
}
