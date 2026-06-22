import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.findUserByIdUseCase.execute(id);
  }
}
