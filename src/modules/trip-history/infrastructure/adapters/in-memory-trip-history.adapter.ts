import { Injectable } from '@nestjs/common';
import {
  TripHistoryPort,
  TripHistoryFilter,
} from '../../domain/ports/trip-history.port';
import {
  TripHistoryPage,
  TripHistoryEntry,
} from '../../domain/value-objects/trip-history-entry.vo';

@Injectable()
export class InMemoryTripHistoryAdapter extends TripHistoryPort {
  private readonly entries: TripHistoryEntry[] = [];

  seed(entry: TripHistoryEntry): void {
    this.entries.push(entry);
  }

  async getHistory(filter: TripHistoryFilter): Promise<TripHistoryPage> {
    let filtered = this.applyRoleFilter(this.entries, filter);
    filtered = this.applyStatusFilter(filtered, filter.status);
    filtered = this.applyDateFilter(filtered, filter.fromDate, filter.toDate);
    filtered = this.sortDescByDepartureAt(filtered);

    const total = filtered.length;
    const totalPages = filter.pageSize > 0 ? Math.ceil(total / filter.pageSize) : 0;
    const offset = (filter.page - 1) * filter.pageSize;
    const entries = filtered.slice(offset, offset + filter.pageSize);

    return { entries, total, page: filter.page, pageSize: filter.pageSize, totalPages };
  }

  async getTripDetail(
    tripId: string,
    _userId: string,
  ): Promise<TripHistoryEntry | null> {
    return this.entries.find((e) => e.tripId === tripId) ?? null;
  }

  private applyRoleFilter(
    entries: TripHistoryEntry[],
    filter: TripHistoryFilter,
  ): TripHistoryEntry[] {
    if (filter.role === 'DRIVER') {
      return entries.filter(
        (e) => e.role === 'DRIVER' && e.driver.driverId === filter.userId,
      );
    }
    return entries.filter(
      (e) => e.role === 'PASSENGER',
    );
  }

  private applyStatusFilter(
    entries: TripHistoryEntry[],
    status?: string,
  ): TripHistoryEntry[] {
    if (!status) return entries;
    return entries.filter((e) => e.status === status);
  }

  private applyDateFilter(
    entries: TripHistoryEntry[],
    fromDate?: Date,
    toDate?: Date,
  ): TripHistoryEntry[] {
    return entries.filter((e) => {
      if (fromDate && e.departureAt < fromDate) return false;
      if (toDate && e.departureAt > toDate) return false;
      return true;
    });
  }

  private sortDescByDepartureAt(
    entries: TripHistoryEntry[],
  ): TripHistoryEntry[] {
    return [...entries].sort(
      (a, b) => b.departureAt.getTime() - a.departureAt.getTime(),
    );
  }
}
