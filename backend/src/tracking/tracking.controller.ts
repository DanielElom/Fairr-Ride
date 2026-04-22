import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tracking')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get(':orderId/trail')
  getTrail(@CurrentUser() user: any, @Param('orderId') orderId: string) {
    return this.trackingService.getGpsTrail(orderId, user.id, user.role);
  }
}
