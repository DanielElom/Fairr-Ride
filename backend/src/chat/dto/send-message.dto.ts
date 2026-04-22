import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { MessageType } from '../../../generated/prisma/enums';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  messageType: MessageType;
}
