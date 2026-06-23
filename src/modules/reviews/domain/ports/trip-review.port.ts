export interface TripParticipants {
  driverId: string;
  passengerIds: string[];
  isCompleted: boolean;
}

export abstract class TripReviewPort {
  abstract getTripParticipants(
    tripId: string,
  ): Promise<TripParticipants | null>;
}
