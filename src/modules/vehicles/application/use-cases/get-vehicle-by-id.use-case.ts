import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { VehicleResponseDto } from '../dtos/vehicle-response.dto';
import { VehicleMapper } from '../mappers/vehicle.mapper';

@Injectable()
export class GetVehicleByIdUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return VehicleMapper.toResponse(vehicle);
  }
}
