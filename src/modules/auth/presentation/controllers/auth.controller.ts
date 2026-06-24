import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { ForgotPasswordDto } from '../../application/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario', description: 'Crea una cuenta y devuelve tokens JWT.' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'El email ya está registrado.' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica al usuario y devuelve tokens JWT.' })
  @ApiResponse({ status: 200, description: 'Login exitoso.', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Revoca el refresh token del usuario.' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  logout(@Body() dto: LogoutDto): Promise<void> {
    return this.logoutUseCase.execute(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description: 'Envía un token temporal al correo electrónico del usuario.',
  })
  @ApiResponse({ status: 200, description: 'Si el correo existe, se envió el email de recuperación.' })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña usando el token temporal recibido por correo.',
  })
  @ApiResponse({ status: 204, description: 'Contraseña restablecida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado.' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.resetPasswordUseCase.execute(dto);
  }
}
