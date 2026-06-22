import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegisterVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  plate: string;

  @IsString()
  color: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  totalSeats: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
