import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { VehicleResponseDto } from '../dtos/vehicle-response.dto';
import { VehicleMapper } from '../mappers/vehicle.mapper';

interface UpdateVehicleInput {
  vehicleId: string;
  ownerId: string;
  dto: UpdateVehicleDto;
}

@Injectable()
export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute({ vehicleId, ownerId, dto }: UpdateVehicleInput): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.ownerId !== ownerId) throw new ForbiddenException('Vehicle does not belong to you');

    if (dto.brand) vehicle.brand = dto.brand;
    if (dto.model) vehicle.model = dto.model;
    if (dto.year) vehicle.year = dto.year;
    if (dto.color) vehicle.color = dto.color;
    if (dto.totalSeats) vehicle.totalSeats = dto.totalSeats;
    if (dto.photoUrl !== undefined) vehicle.photoUrl = dto.photoUrl;
    if (dto.status) vehicle.status = dto.status;
    vehicle.touch();

    const updated = await this.vehicleRepository.update(vehicle);
    return VehicleMapper.toResponse(updated);
  }
}
