import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const AVG_SPEED_KMH = 30;

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  private get db() {
    return this.prisma as any;
  }

  calculateEta(
    currentLat: number,
    currentLng: number,
    destLat: number,
    destLng: number,
  ): { eta: number; distanceRemaining: number } {
    const R = 6371;
    const dLat = ((destLat - currentLat) * Math.PI) / 180;
    const dLng = ((destLng - currentLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((currentLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const eta = Math.max(1, Math.round((distanceKm / AVG_SPEED_KMH) * 60));
    return {
      eta,
      distanceRemaining: Math.round(distanceKm * 100) / 100,
    };
  }

  async logLocation(
    riderUserId: string,
    orderId: string,
    latitude: number,
    longitude: number,
  ): Promise<{ eta: number; distanceRemaining: number }> {
    const order = await this.db.order.findUnique({ where: { id: orderId } });
    if (!order) return { eta: 0, distanceRemaining: 0 };

    await Promise.all([
      this.db.gpsLog.create({
        data: { orderId, latitude, longitude, timestamp: new Date() },
      }),
      this.db.riderProfile.updateMany({
        where: { userId: riderUserId },
        data: { latitude, longitude, lastSeenAt: new Date() },
      }),
    ]);

    const destLat = parseFloat(order.dropoffLatitude.toString());
    const destLng = parseFloat(order.dropoffLongitude.toString());
    return this.calculateEta(latitude, longitude, destLat, destLng);
  }

  async getGpsTrail(
    orderId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: { rider: { select: { userId: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isOwner = order.userId === requesterId;
    const isRider = order.rider?.userId === requesterId;
    const isAdmin = requesterRole === 'ADMIN';
    if (!isOwner && !isRider && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    return this.db.gpsLog.findMany({
      where: { orderId },
      orderBy: { timestamp: 'asc' },
      select: { latitude: true, longitude: true, timestamp: true },
    });
  }
}
