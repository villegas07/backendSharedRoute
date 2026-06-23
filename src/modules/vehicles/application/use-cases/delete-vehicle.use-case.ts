import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';

interface DeleteVehicleInput {
  vehicleId: string;
  ownerId: string;
}

@Injectable()
export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute({ vehicleId, ownerId }: DeleteVehicleInput): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.ownerId !== ownerId) throw new ForbiddenException('Vehicle does not belong to you');
    await this.vehicleRepository.delete(vehicleId);
  }
}
