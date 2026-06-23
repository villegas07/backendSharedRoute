import { Injectable } from '@nestjs/common';
import { TripReviewPort, TripParticipants } from '../../domain/ports/trip-review.port';

// STUB adapter — to be replaced by real trip query in ORM phase
@Injectable()
export class StubTripReviewAdapter extends TripReviewPort {
  async getTripParticipants(
    _tripId: string,
  ): Promise<TripParticipants | null> {
    return null;
  }
}
