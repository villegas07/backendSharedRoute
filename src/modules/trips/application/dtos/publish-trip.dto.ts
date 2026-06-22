import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PublishTripDto {
  @IsString()
  vehicleId: string;

  @IsString()
  originAddress: string;

  @IsString()
  originCity: string;

  @IsNumber()
  originLatitude: number;

  @IsNumber()
  originLongitude: number;

  @IsString()
  destinationAddress: string;

  @IsString()
  destinationCity: string;

  @IsNumber()
  destinationLatitude: number;

  @IsNumber()
  destinationLongitude: number;

  @IsDate()
  @Type(() => Date)
  departureAt: Date;

  @IsNumber()
  @Min(1)
  availableSeats: number;

  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
