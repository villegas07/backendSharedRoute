import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { GetTripHistoryUseCase } from '../../application/use-cases/get-trip-history.use-case';
import { GetTripHistoryDetailUseCase } from '../../application/use-cases/get-trip-history-detail.use-case';
import { TripHistoryQueryDto } from '../../application/dtos/trip-history-query.dto';
import { TripHistoryPageDto, TripHistoryEntryDto } from '../../application/dtos/trip-history-response.dto';

@ApiTags('trip-history')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('trip-history')
export class TripHistoryController {
  constructor(
    private readonly getHistoryUseCase: GetTripHistoryUseCase,
    private readonly getDetailUseCase: GetTripHistoryDetailUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Historial de rutas del usuario autenticado',
    description: 'Historial paginado con conductor, origen/destino, costo, duración, calificación. Usa `role=DRIVER` para conductor o `role=PASSENGER` para pasajero.',
  })
  @ApiResponse({ status: 200, type: TripHistoryPageDto })
  async getHistory(
    @Query() query: TripHistoryQueryDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.getHistoryUseCase.execute({
      userId: req.user?.id ?? '',
      role: query.role ?? 'PASSENGER',
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      status: query.status,
    });
  }

  @Get(':tripId')
  @ApiParam({ name: 'tripId', description: 'UUID del viaje', type: 'string' })
  @ApiOperation({
    summary: 'Detalle de una ruta del historial',
    description: 'Toda la información del viaje: conductor, vehículo, calificación, costo total, duración, etc.',
  })
  @ApiResponse({ status: 200, type: TripHistoryEntryDto })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado en historial' })
  async getTripDetail(
    @Param('tripId') tripId: string,
    @Req() req: { user?: { id?: string } },
  ) {
    const detail = await this.getDetailUseCase.execute({ tripId, userId: req.user?.id ?? '' });
    if (!detail) throw new NotFoundException('Viaje no encontrado en tu historial');
    return detail;
  }
}
