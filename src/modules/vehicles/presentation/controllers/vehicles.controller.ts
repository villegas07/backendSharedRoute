import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { RegisterVehicleUseCase } from '../../application/use-cases/register-vehicle.use-case';
import { GetVehicleByIdUseCase } from '../../application/use-cases/get-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { RegisterVehicleDto } from '../../application/dtos/register-vehicle.dto';
import { UpdateVehicleDto } from '../../application/dtos/update-vehicle.dto';
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
    private readonly getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar vehículo' })
  @ApiResponse({ status: 201, type: VehicleResponseDto })
  @ApiResponse({ status: 409, description: 'La placa ya está registrada.' })
  register(
    @Body() dto: RegisterVehicleDto,
    @CurrentUser() user: { sub: string },
  ): Promise<VehicleResponseDto> {
    return this.registerVehicleUseCase.execute({ ownerId: user.sub, dto });
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis vehículos' })
  @ApiResponse({ status: 200, type: [VehicleResponseDto] })
  async findMyVehicles(
    @CurrentUser() user: { sub: string },
  ): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findByOwnerId(user.sub);
    return VehicleMapper.toResponseList(vehicles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  @ApiResponse({ status: 200, type: VehicleResponseDto })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado.' })
  findById(@Param('id') id: string): Promise<VehicleResponseDto> {
    return this.getVehicleByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vehículo' })
  @ApiResponse({ status: 200, type: VehicleResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: { sub: string },
  ): Promise<VehicleResponseDto> {
    return this.updateVehicleUseCase.execute({ vehicleId: id, ownerId: user.sub, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar vehículo' })
  @ApiResponse({ status: 204, description: 'Vehículo eliminado.' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.deleteVehicleUseCase.execute({ vehicleId: id, ownerId: user.sub });
  }
}

