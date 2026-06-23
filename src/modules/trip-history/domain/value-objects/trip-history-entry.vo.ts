import { TripLocationSnapshot } from '../value-objects/trip-location-snapshot.vo';
import { DriverInfo } from '../value-objects/driver-info.vo';
import { RatingSnapshot } from '../value-objects/rating-snapshot.vo';

export type TripHistoryRole = 'DRIVER' | 'PASSENGER';

export interface TripHistoryEntry {
  readonly tripId: string;
  readonly role: TripHistoryRole;
  readonly status: string;
  readonly origin: TripLocationSnapshot;
  readonly destination: TripLocationSnapshot;
  readonly departureAt: Date;
  readonly arrivedAt?: Date;
  readonly durationMinutes?: number;
  readonly driver: DriverInfo;
  readonly seatsReserved: number;
  readonly pricePerSeat: number;
  readonly totalPaid: number;
  readonly passengerCount: number;
  readonly rating?: RatingSnapshot;
  readonly notes?: string;
}

export interface TripHistoryPage {
  readonly entries: TripHistoryEntry[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
