import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { VehicleEntity } from '../entities/vehicle.entity';

export abstract class VehicleRepository extends BaseRepository<VehicleEntity> {
  abstract findByOwnerId(ownerId: string): Promise<VehicleEntity[]>;
  abstract findByPlate(plate: string): Promise<VehicleEntity | null>;
}
