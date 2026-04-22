import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MapsService } from './maps/maps.service';
import { MatchingService } from '../matching/matching.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../../generated/prisma/enums';

const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ASSIGNED,
  OrderStatus.EN_ROUTE_TO_PICKUP,
];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private maps: MapsService,
    @Inject(forwardRef(() => MatchingService))
    private matching: MatchingService,
    private subscriptions: SubscriptionsService,
    private notifications: NotificationsService,
  ) {}

  private get db() {
    return this.prisma as any;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const distanceKm = await this.maps.getDistanceKm(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.dropoffLatitude,
      dto.dropoffLongitude,
    );

    const [baseFareRaw, perKmRateRaw, surgeRaw] = await Promise.all([
      this.redis.get('config:baseFare'),
      this.redis.get('config:perKmRate'),
      this.redis.get('config:surgeMultiplier'),
    ]);
    const baseFare = parseFloat(baseFareRaw ?? '300');
    const perKmRate = parseFloat(perKmRateRaw ?? '120');
    const surgeMultiplier = parseFloat(surgeRaw ?? '1.0');

    const finalPrice = Math.round((baseFare + distanceKm * perKmRate) * surgeMultiplier);

    const isPremium = await this.subscriptions.hasActiveSubscription(userId);

    const businessAccount = await this.db.businessAccount.findUnique({
      where: { userId },
    });

    const order = await this.db.order.create({
      data: {
        userId,
        businessAccountId: businessAccount?.id ?? null,
        pickupAddress: dto.pickupAddress,
        pickupLatitude: dto.pickupLatitude,
        pickupLongitude: dto.pickupLongitude,
        dropoffAddress: dto.dropoffAddress,
        dropoffLatitude: dto.dropoffLatitude,
        dropoffLongitude: dto.dropoffLongitude,
        distanceKm,
        baseFare,
        perKmRate,
        surgeMultiplier,
        finalPrice,
        deliveryType: dto.deliveryType,
        scheduledAt: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        paymentMethod: dto.paymentMethod,
        isPremium,
        status: OrderStatus.PENDING,
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Fire-and-forget: don't block the API response
    this.matching.findMatch(order.id).catch((err) =>
      this.logger.error(`Matching failed for order ${order.id}: ${err.message}`),
    );
    this.notifications.sendOrderNotification(order.id, 'PENDING').catch(() => null);

    return order;
  }

  async getOrders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          rider: {
            select: { id: true, user: { select: { name: true, phone: true } } },
          },
        },
      }),
      this.db.order.count({ where: { userId } }),
    ]);

    return { data: orders, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getOrderById(orderId: string, requesterId: string, requesterRole: string) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        rider: {
          select: { id: true, userId: true, user: { select: { name: true, phone: true } } },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isOwner = order.userId === requesterId;
    const isRider = order.rider?.userId === requesterId;
    const isAdmin = requesterRole === 'ADMIN';

    if (!isOwner && !isRider && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await this.db.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel an order with status ${order.status}`,
      );
    }

    const updated = await this.db.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancellationReason: reason,
      },
    });
    this.notifications.sendOrderNotification(orderId, 'CANCELLED').catch(() => null);
    return updated;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.db.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.db.order.update({ where: { id: orderId }, data: { status } });
  }

  async getAdminOrders(filters: {
    status?: OrderStatus;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          rider: {
            select: { id: true, user: { select: { name: true, phone: true } } },
          },
        },
      }),
      this.db.order.count({ where }),
    ]);

    return { data: orders, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
