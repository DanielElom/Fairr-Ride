import { IsBoolean } from 'class-validator';

export class ToggleStatusDto {
  @IsBoolean()
  isOnline: boolean;
}
