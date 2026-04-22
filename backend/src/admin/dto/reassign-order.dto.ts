import { IsString, IsNotEmpty } from 'class-validator';

export class ReassignOrderDto {
  @IsString()
  @IsNotEmpty()
  newRiderId: string;
}
