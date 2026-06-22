import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.findUserByIdUseCase.execute(id);
  }
}
