import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { TripHistoryPort, TripHistoryFilter } from '../../domain/ports/trip-history.port';
import { TripHistoryPage } from '../../domain/value-objects/trip-history-entry.vo';

export type GetTripHistoryInput = TripHistoryFilter;

@Injectable()
export class GetTripHistoryUseCase
  implements UseCase<GetTripHistoryInput, TripHistoryPage>
{
  constructor(private readonly historyPort: TripHistoryPort) {}

  async execute(input: GetTripHistoryInput): Promise<TripHistoryPage> {
    return this.historyPort.getHistory(input);
  }
}
