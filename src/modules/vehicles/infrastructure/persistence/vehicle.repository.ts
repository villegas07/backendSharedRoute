import { Injectable } from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';

@Injectable()
export class VehicleRepositoryImpl extends VehicleRepository {
  async findById(_id: string): Promise<VehicleEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<VehicleEntity[]> { throw new Error('Not implemented'); }
  async findByOwnerId(_ownerId: string): Promise<VehicleEntity[]> { throw new Error('Not implemented'); }
  async findByPlate(_plate: string): Promise<VehicleEntity | null> { throw new Error('Not implemented'); }
  async save(_entity: VehicleEntity): Promise<VehicleEntity> { throw new Error('Not implemented'); }
  async update(_entity: VehicleEntity): Promise<VehicleEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
