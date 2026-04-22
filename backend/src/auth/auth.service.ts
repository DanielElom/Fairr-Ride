import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '../../generated/prisma/enums';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';

const OTP_TTL = 600; // 10 minutes
const OTP_PREFIX = 'otp:';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private sms: SmsService,
    private jwt: JwtService,
  ) {}

  async requestOtp(phone: string): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`${OTP_PREFIX}${phone}`, otp, OTP_TTL);
    await this.sms.sendOtp(phone, otp);
    return { message: 'OTP sent' };
  }

  async verifyOtp(
    phone: string,
    otp: string,
    role?: UserRole,
  ): Promise<{ accessToken: string; user: User; isNewUser: boolean }> {
    const stored = await this.redis.get(`${OTP_PREFIX}${phone}`);

    if (!stored || stored !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redis.del(`${OTP_PREFIX}${phone}`);

    const db = this.prisma as any;
    let user: User = await db.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      if (!role) throw new BadRequestException('role is required for new users');
      user = await db.user.create({
        data: { phone, role, status: UserStatus.PENDING_VERIFICATION },
      });
    }

    const accessToken = this.generateToken(user);
    return { accessToken, user, isNewUser };
  }

  generateToken(user: User): string {
    return this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });
  }

  async validateUser(userId: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({ where: { id: userId } });
  }
}
