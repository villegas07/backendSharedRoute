import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { StartNavigationUseCase } from '../../application/use-cases/start-navigation.use-case';
import { EndNavigationUseCase } from '../../application/use-cases/end-navigation.use-case';
import { GetNavigationViewUseCase } from '../../application/use-cases/get-navigation-view.use-case';
import { NavigationGateway } from '../gateways/navigation.gateway';
import { StartNavigationDto } from '../../application/dtos/start-navigation.dto';

@ApiTags('navigation')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('navigation')
export class NavigationController {
  constructor(
    private readonly startNavigationUseCase: StartNavigationUseCase,
    private readonly endNavigationUseCase: EndNavigationUseCase,
    private readonly getViewUseCase: GetNavigationViewUseCase,
    private readonly navigationGateway: NavigationGateway,
  ) {}

  @Post('start')
  @ApiOperation({
    summary: 'Iniciar navegación',
    description:
      'El conductor inicia la navegación del viaje. Calcula la ruta con Google Directions y crea una sesión en tiempo real.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión de navegación creada exitosamente',
  })
  async startNavigation(
    @Body() dto: StartNavigationDto,
    @Req() req: { user?: { id?: string } },
  ) {
    const driverId = req.user?.id ?? '';
    return this.startNavigationUseCase.execute({
      ...dto,
      driverId,
    });
  }

  @Get(':sessionId/driver')
  @ApiOperation({
    summary: 'Vista del conductor',
    description:
      'Obtiene la vista de navegación del conductor: ruta completa, paso actual, ETA y lista de pasajeros.',
  })
  @ApiResponse({ status: 200, description: 'Vista del conductor' })
  async getDriverView(
    @Param('sessionId') sessionId: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.getViewUseCase.execute({
      sessionId,
      userId: req.user?.id ?? '',
      role: 'DRIVER',
    });
  }

  @Get(':sessionId/passenger')
  @ApiOperation({
    summary: 'Vista del pasajero',
    description:
      'Obtiene la vista del pasajero: ubicación del conductor en tiempo real, polyline de la ruta, ETA estimado.',
  })
  @ApiResponse({ status: 200, description: 'Vista del pasajero' })
  async getPassengerView(
    @Param('sessionId') sessionId: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.getViewUseCase.execute({
      sessionId,
      userId: req.user?.id ?? '',
      role: 'PASSENGER',
    });
  }

  @Patch(':sessionId/end')
  @ApiOperation({
    summary: 'Finalizar navegación',
    description: 'El conductor finaliza la navegación al llegar al destino.',
  })
  @ApiResponse({ status: 200, description: 'Navegación finalizada' })
  async endNavigation(
    @Param('sessionId') sessionId: string,
    @Req() req: { user?: { id?: string } },
  ) {
    const result = await this.endNavigationUseCase.execute({
      sessionId,
      driverId: req.user?.id ?? '',
    });

    this.navigationGateway.broadcastSessionEnded(sessionId);
    return result;
  }
}
