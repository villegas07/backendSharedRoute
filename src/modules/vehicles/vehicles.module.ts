import { Module } from '@nestjs/common';
import { VehicleRepository } from './domain/repositories/vehicle.repository.interface';
import { RegisterVehicleUseCase } from './application/use-cases/register-vehicle.use-case';
import { GetVehicleByIdUseCase } from './application/use-cases/get-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { VehicleRepositoryImpl } from './infrastructure/persistence/vehicle.repository';
import { VehiclesController } from './presentation/controllers/vehicles.controller';

@Module({
  controllers: [VehiclesController],
  providers: [
    { provide: VehicleRepository, useClass: VehicleRepositoryImpl },
    RegisterVehicleUseCase,
    GetVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [VehicleRepository],
})
export class VehiclesModule {}
