import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac } from 'crypto';

const BASE_URL = 'https://cashierapi.opayweb.com/api/v3';

@Injectable()
export class OpayService {
  private readonly logger = new Logger(OpayService.name);

  constructor(private config: ConfigService) {}

  private get secretKey(): string {
    return this.config.get<string>('OPAY_SECRET_KEY') || '';
  }

  async initiatePayment(
    amountNaira: number,
    reference: string,
    phone: string,
  ): Promise<{ paymentUrl: string; reference: string }> {
    if (!this.secretKey) {
      this.logger.warn('[DEV] OPAY_SECRET_KEY not set — returning mock Opay URL');
      return {
        paymentUrl: `https://cashier.opayweb.com/mock/${reference}`,
        reference,
      };
    }

    const { data } = await axios.post(
      `${BASE_URL}/international/cashier/create`,
      {
        reference,
        mchShortName: 'FairRide',
        productName: 'Delivery',
        productDesc: 'FairRide delivery payment',
        supplierInfo: '',
        amount: { total: amountNaira * 100, currency: 'NGN' },
        callbackUrl: '',
        returnUrl: '',
        expireAt: 30,
        userInfo: { userPhone: phone },
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          MerchantId: this.config.get<string>('OPAY_MERCHANT_ID') || '',
        },
      },
    );
    return {
      paymentUrl: data.data.cashierUrl,
      reference,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.secretKey) return true;
    const hash = createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }
}
