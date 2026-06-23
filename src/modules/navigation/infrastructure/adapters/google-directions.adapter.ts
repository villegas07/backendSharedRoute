import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  Language,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js';
import { DirectionsPort } from '../../domain/ports/directions.port';
import { RouteInfo, RouteStep } from '../../domain/value-objects/route-info.vo';

@Injectable()
export class GoogleDirectionsAdapter extends DirectionsPort {
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly language: Language;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('googleMaps.apiKey', '');
    this.language = this.configService.get<string>(
      'googleMaps.defaultLanguage',
      'es',
    ) as Language;
  }

  async getDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<RouteInfo> {
    const response = await this.safeCall(() =>
      this.client.directions({
        params: {
          origin: { lat: originLat, lng: originLng },
          destination: { lat: destinationLat, lng: destinationLng },
          mode: TravelMode.driving,
          language: this.language,
          units: UnitSystem.metric,
          key: this.apiKey,
        },
      }),
    );

    const route = response.data.routes[0];
    if (!route) {
      throw new InternalServerErrorException(
        'No se encontró ruta entre los puntos proporcionados',
      );
    }

    const leg = route.legs[0];
    const steps: RouteStep[] = leg.steps.map((s) => ({
      instruction: s.html_instructions || '',
      distance: s.distance?.text || '',
      duration: s.duration?.text || '',
      startLat: s.start_location.lat,
      startLng: s.start_location.lng,
      endLat: s.end_location.lat,
      endLng: s.end_location.lng,
      maneuver: s.maneuver || undefined,
    }));

    return {
      polyline: route.overview_polyline?.points || '',
      distanceText: leg.distance?.text || '',
      distanceMeters: leg.distance?.value || 0,
      durationText: leg.duration?.text || '',
      durationSeconds: leg.duration?.value || 0,
      steps,
      startAddress: leg.start_address || '',
      endAddress: leg.end_address || '',
    };
  }

  async getEtaSeconds(
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<number> {
    const response = await this.safeCall(() =>
      this.client.directions({
        params: {
          origin: { lat: currentLat, lng: currentLng },
          destination: { lat: destinationLat, lng: destinationLng },
          mode: TravelMode.driving,
          key: this.apiKey,
        },
      }),
    );

    const route = response.data.routes[0];
    if (!route) return 0;
    return route.legs[0]?.duration?.value || 0;
  }

  private async safeCall<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google Directions API error';
      throw new InternalServerErrorException(
        `Error en servicio de direcciones: ${message}`,
      );
    }
  }
}
