import { TripHistoryPage } from '../value-objects/trip-history-entry.vo';

export interface TripHistoryFilter {
  userId: string;
  role: 'DRIVER' | 'PASSENGER';
  page: number;
  pageSize: number;
  fromDate?: Date;
  toDate?: Date;
  status?: string;
}

export abstract class TripHistoryPort {
  abstract getHistory(filter: TripHistoryFilter): Promise<TripHistoryPage>;
  abstract getTripDetail(
    tripId: string,
    userId: string,
  ): Promise<import('../value-objects/trip-history-entry.vo').TripHistoryEntry | null>;
}
