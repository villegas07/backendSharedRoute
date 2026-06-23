import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeocodedAddressResponseDto, PlacePredictionResponseDto } from '../../application/dtos/geocoded-address-response.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { ReverseGeocodeUseCase } from '../../application/use-cases/reverse-geocode.use-case';
import { SearchPlacesUseCase } from '../../application/use-cases/search-places.use-case';
import { GeocodeAddressUseCase } from '../../application/use-cases/geocode-address.use-case';
import { GetPlaceDetailsUseCase } from '../../application/use-cases/get-place-details.use-case';
import { ReverseGeocodeDto } from '../../application/dtos/reverse-geocode.dto';
import { SearchPlacesDto } from '../../application/dtos/search-places.dto';
import { GeocodeAddressDto } from '../../application/dtos/geocode-address.dto';
import { PlaceDetailsDto } from '../../application/dtos/place-details.dto';

@ApiTags('geolocation')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('geolocation')
export class GeolocationController {
  constructor(
    private readonly reverseGeocodeUseCase: ReverseGeocodeUseCase,
    private readonly searchPlacesUseCase: SearchPlacesUseCase,
    private readonly geocodeAddressUseCase: GeocodeAddressUseCase,
    private readonly getPlaceDetailsUseCase: GetPlaceDetailsUseCase,
  ) {}

  @Post('reverse-geocode')
  @ApiOperation({
    summary: 'Geocodificación inversa',
    description: 'Convierte coordenadas (lat/lng) en una dirección legible. Útil para detectar automáticamente el punto de inicio.',
  })
  @ApiResponse({ status: 200, type: GeocodedAddressResponseDto, description: 'Dirección obtenida exitosamente' })
  @ApiResponse({ status: 400, description: 'Coordenadas inválidas' })
  async reverseGeocode(@Body() dto: ReverseGeocodeDto) {
    return this.reverseGeocodeUseCase.execute(dto);
  }

  @Get('search-places')
  @ApiOperation({
    summary: 'Buscar lugares',
    description: 'Busca lugares por texto con autocompletado. Ideal para que el usuario defina su destino.',
  })
  @ApiResponse({ status: 200, type: [PlacePredictionResponseDto], description: 'Lista de sugerencias de lugares' })
  async searchPlaces(@Query() dto: SearchPlacesDto) {
    return this.searchPlacesUseCase.execute(dto);
  }

  @Get('geocode')
  @ApiOperation({
    summary: 'Geocodificar dirección',
    description: 'Convierte una dirección de texto en coordenadas geográficas.',
  })
  @ApiResponse({ status: 200, type: GeocodedAddressResponseDto, description: 'Coordenadas obtenidas exitosamente' })
  async geocodeAddress(@Query() dto: GeocodeAddressDto) {
    return this.geocodeAddressUseCase.execute(dto.address);
  }

  @Get('place-details')
  @ApiOperation({
    summary: 'Detalles de un lugar',
    description: 'Obtiene información detallada de un lugar por su placeId de Google.',
  })
  @ApiResponse({ status: 200, type: GeocodedAddressResponseDto, description: 'Detalles del lugar' })
  async getPlaceDetails(@Query() dto: PlaceDetailsDto) {
    return this.getPlaceDetailsUseCase.execute(dto.placeId);
  }
}
