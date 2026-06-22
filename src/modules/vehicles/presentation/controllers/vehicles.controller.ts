import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { RegisterVehicleUseCase } from '../../application/use-cases/register-vehicle.use-case';
import { RegisterVehicleDto } from '../../application/dtos/register-vehicle.dto';
import { VehicleResponseDto } from '../../application/dtos/vehicle-response.dto';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { VehicleMapper } from '../../application/mappers/vehicle.mapper';

@ApiTags('vehicles')
@ApiBearerAuth('access-token')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(
    private readonly registerVehicleUseCase: RegisterVehicleUseCase,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar vehículo', description: 'El conductor registra un nuevo vehículo.' })
  @ApiResponse({ status: 201, description: 'Vehículo registrado.', type: VehicleResponseDto })
  @ApiResponse({ status: 409, description: 'La placa ya está registrada.' })
  register(
    @Body() dto: RegisterVehicleDto,
    @CurrentUser() user: { sub: string },
  ): Promise<VehicleResponseDto> {
    return this.registerVehicleUseCase.execute({ ownerId: user.sub, dto });
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis vehículos', description: 'Retorna los vehículos del conductor autenticado.' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos.', type: [VehicleResponseDto] })
  async findMyVehicles(@CurrentUser() user: { sub: string }): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findByOwnerId(user.sub);
    return VehicleMapper.toResponseList(vehicles);
  }
}
