import { Module } from '@nestjs/common';
import { VehicleRepository } from './domain/repositories/vehicle.repository.interface';
import { RegisterVehicleUseCase } from './application/use-cases/register-vehicle.use-case';
import { VehicleRepositoryImpl } from './infrastructure/persistence/vehicle.repository';
import { VehiclesController } from './presentation/controllers/vehicles.controller';

@Module({
  controllers: [VehiclesController],
  providers: [
    { provide: VehicleRepository, useClass: VehicleRepositoryImpl },
    RegisterVehicleUseCase,
  ],
  exports: [VehicleRepository],
})
export class VehiclesModule {}
