import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { IsAdminGuard } from '../../../../shared/guards/is-admin.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { ReviewDocumentUseCase } from '../../application/use-cases/review-document.use-case';
import { GetDriverDocumentsUseCase } from '../../application/use-cases/get-driver-documents.use-case';
import { GetDocumentByIdUseCase } from '../../application/use-cases/get-document-by-id.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/delete-document.use-case';
import { UploadSoatDto } from '../../application/dtos/upload-soat.dto';
import { UploadLicenseDto } from '../../application/dtos/upload-license.dto';
import { UploadCedulaDto } from '../../application/dtos/upload-cedula.dto';
import { ReviewDocumentDto } from '../../application/dtos/review-document.dto';
import { DocumentResponseDto } from '../../application/dtos/document-response.dto';
import { DocumentType } from '../../domain/entities/driver-document.entity';

const fileInterceptor = () =>
  FileInterceptor('file', { storage: memoryStorage() });

function fileSchema(description: string): object {
  return {
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description },
      },
    },
  };
}

@ApiTags('documents')
@ApiBearerAuth('access-token')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly reviewDocumentUseCase: ReviewDocumentUseCase,
    private readonly getDriverDocumentsUseCase: GetDriverDocumentsUseCase,
    private readonly getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  // ── SOAT ─────────────────────────────────────────────────────────────

  @Post('soat')
  @UseInterceptors(fileInterceptor())
  @ApiOperation({
    summary: 'Subir SOAT',
    description: 'Acepta foto (JPG/PNG/WEBP) o PDF. Requiere número de póliza y fecha de vencimiento.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'identificationNumber', 'expiresAt'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Foto o PDF del SOAT (máx 10 MB)' },
        identificationNumber: { type: 'string', example: 'SOA-2024-789456', description: 'Número de póliza' },
        expiresAt: { type: 'string', format: 'date', example: '2027-01-15', description: 'Fecha de vencimiento' },
        vehicleId: { type: 'string', description: 'ID del vehículo (opcional)' },
      },
    },
  })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  uploadSoat(
    @Body() dto: UploadSoatDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: string },
  ): Promise<DocumentResponseDto> {
    return this.uploadDocumentUseCase.execute({
      driverId: user.sub,
      type: DocumentType.SOAT,
      file,
      identificationNumber: dto.identificationNumber,
      expiresAt: dto.expiresAt,
      vehicleId: dto.vehicleId,
    });
  }

  // ── Licencia ─────────────────────────────────────────────────────────

  @Post('license')
  @UseInterceptors(fileInterceptor())
  @ApiOperation({
    summary: 'Subir Licencia de conducción',
    description: 'Acepta foto (JPG/PNG/WEBP) o PDF. Requiere número de licencia y fecha de vencimiento.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'identificationNumber', 'expiresAt'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Foto o PDF de la licencia (máx 10 MB)' },
        identificationNumber: { type: 'string', example: '123456789', description: 'Número de licencia' },
        expiresAt: { type: 'string', format: 'date', example: '2030-06-20', description: 'Fecha de vencimiento' },
      },
    },
  })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  uploadLicense(
    @Body() dto: UploadLicenseDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: string },
  ): Promise<DocumentResponseDto> {
    return this.uploadDocumentUseCase.execute({
      driverId: user.sub,
      type: DocumentType.LICENSE,
      file,
      identificationNumber: dto.identificationNumber,
      expiresAt: dto.expiresAt,
    });
  }

  // ── Cédula ───────────────────────────────────────────────────────────

  @Post('cedula')
  @UseInterceptors(fileInterceptor())
  @ApiOperation({
    summary: 'Subir Cédula de ciudadanía',
    description: 'Acepta foto (JPG/PNG/WEBP) o PDF. Solo requiere número de cédula.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'identificationNumber'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Foto o PDF de la cédula (máx 10 MB)' },
        identificationNumber: { type: 'string', example: '1020304050', description: 'Número de cédula' },
      },
    },
  })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  uploadCedula(
    @Body() dto: UploadCedulaDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: string },
  ): Promise<DocumentResponseDto> {
    return this.uploadDocumentUseCase.execute({
      driverId: user.sub,
      type: DocumentType.CEDULA,
      file,
      identificationNumber: dto.identificationNumber,
    });
  }

  // ── Consultas ─────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: 'Mis documentos subidos' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  findMyDocuments(@CurrentUser() user: { sub: string }): Promise<DocumentResponseDto[]> {
    return this.getDriverDocumentsUseCase.execute(user.sub);
  }

  @Get('driver/:driverId')
  @UseGuards(IsAdminGuard)
  @ApiOperation({ summary: '[Admin] Ver documentos de un conductor' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  findByDriver(@Param('driverId') driverId: string): Promise<DocumentResponseDto[]> {
    return this.getDriverDocumentsUseCase.execute(driverId);
  }

  // ── Revisión admin ────────────────────────────────────────────────────

  @Patch(':id/review')
  @UseGuards(IsAdminGuard)
  @ApiOperation({ summary: '[Admin] Aprobar o rechazar un documento' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewDocumentDto,
    @CurrentUser() user: { sub: string },
  ): Promise<DocumentResponseDto> {
    return this.reviewDocumentUseCase.execute({ documentId: id, adminId: user.sub, dto });
  }

  // ── CRUD: Get by ID & Delete ──────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Obtener documento por ID' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  findById(@Param('id') id: string): Promise<DocumentResponseDto> {
    return this.getDocumentByIdUseCase.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar documento propio' })
  @ApiResponse({ status: 204, description: 'Documento eliminado.' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.deleteDocumentUseCase.execute({ documentId: id, driverId: user.sub });
  }
}
