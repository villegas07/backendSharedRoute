import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { TripHistoryPort } from '../../domain/ports/trip-history.port';
import { TripHistoryEntry } from '../../domain/value-objects/trip-history-entry.vo';

interface GetTripDetailInput {
  tripId: string;
  userId: string;
}

@Injectable()
export class GetTripHistoryDetailUseCase
  implements UseCase<GetTripDetailInput, TripHistoryEntry | null>
{
  constructor(private readonly historyPort: TripHistoryPort) {}

  async execute(
    input: GetTripDetailInput,
  ): Promise<TripHistoryEntry | null> {
    return this.historyPort.getTripDetail(input.tripId, input.userId);
  }
}
