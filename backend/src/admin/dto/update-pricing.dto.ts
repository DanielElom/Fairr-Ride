import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFare?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  surgeMultiplier?: number;
}
