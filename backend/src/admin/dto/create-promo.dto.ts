import { IsIn, IsInt, IsISO8601, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePromoDto {
  @IsString()
  code: string;

  @IsIn(['PERCENTAGE', 'FIXED'])
  discountType: string;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
