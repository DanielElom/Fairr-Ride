import { Module, forwardRef } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingGateway } from './matching.gateway';
import { MatchingProcessor } from './matching.processor';
import { MatchingController } from './matching.controller';
import { OrdersModule } from '../orders/orders.module';
import { TrackingModule } from '../tracking/tracking.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => OrdersModule), TrackingModule, NotificationsModule],
  controllers: [MatchingController],
  providers: [MatchingService, MatchingGateway, MatchingProcessor],
  exports: [MatchingService],
})
export class MatchingModule {}
