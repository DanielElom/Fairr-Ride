import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { MatchingService } from './matching.service';

@Injectable()
export class MatchingProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MatchingProcessor.name);
  private worker: Worker;
  private workerRedis: Redis;

  constructor(private matchingService: MatchingService) {}

  onModuleInit() {
    this.workerRedis = new Redis(
      process.env['REDIS_URL'] || 'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    this.worker = new Worker(
      'matching',
      async (job: Job) => {
        if (job.name === 'rider-timeout') {
          const { orderId, riderId } = job.data as {
            orderId: string;
            riderId: string;
          };
          this.logger.log(
            `Timeout fired: rider ${riderId} did not respond for order ${orderId}`,
          );
          await this.matchingService.riderRejected(orderId, riderId);
        }
      },
      { connection: this.workerRedis },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('BullMQ matching worker started');
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.workerRedis.quit();
  }
}
