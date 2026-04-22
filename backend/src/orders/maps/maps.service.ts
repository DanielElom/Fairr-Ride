import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  constructor(private config: ConfigService) {}

  async getDistanceKm(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<number> {
    const apiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY not set — using mock distance of 5.2 km',
      );
      return 5.2;
    }

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const response = await axios.get(url, {
      params: {
        origins: `${originLat},${originLng}`,
        destinations: `${destLat},${destLng}`,
        units: 'metric',
        key: apiKey,
      },
    });

    const element = response.data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      this.logger.warn(
        `Distance Matrix returned status ${element?.status} — falling back to mock 5.2 km`,
      );
      return 5.2;
    }

    const distanceMetres: number = element.distance.value;
    return Math.round((distanceMetres / 1000) * 100) / 100;
  }
}
