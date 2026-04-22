import { Module } from '@nestjs/common';
import {
  SubscriptionsController,
  AdminSubscriptionsController,
} from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsProcessor } from './subscriptions.processor';
import { PaystackService } from '../payments/paystack/paystack.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController, AdminSubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsProcessor, PaystackService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
