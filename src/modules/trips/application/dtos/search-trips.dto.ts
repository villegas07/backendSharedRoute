import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripsDto {
  @IsString()
  @IsOptional()
  originCity?: string;

  @IsString()
  @IsOptional()
  destinationCity?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  departureDate?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minSeats?: number;
}
