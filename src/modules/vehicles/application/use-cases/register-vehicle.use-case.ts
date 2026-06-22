import { ConflictException, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { RegisterVehicleDto } from '../dtos/register-vehicle.dto';
import { VehicleResponseDto } from '../dtos/vehicle-response.dto';
import { VehicleMapper } from '../mappers/vehicle.mapper';

interface RegisterVehicleInput {
  ownerId: string;
  dto: RegisterVehicleDto;
}

@Injectable()
export class RegisterVehicleUseCase implements UseCase<RegisterVehicleInput, VehicleResponseDto> {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute({ ownerId, dto }: RegisterVehicleInput): Promise<VehicleResponseDto> {
    await this.ensurePlateIsUnique(dto.plate);

    const vehicle = VehicleEntity.create({ ...dto, ownerId });
    const saved = await this.vehicleRepository.save(vehicle);
    return VehicleMapper.toResponse(saved);
  }

  private async ensurePlateIsUnique(plate: string): Promise<void> {
    const existing = await this.vehicleRepository.findByPlate(plate);
    if (existing) throw new ConflictException(`Plate ${plate} already registered`);
  }
}
