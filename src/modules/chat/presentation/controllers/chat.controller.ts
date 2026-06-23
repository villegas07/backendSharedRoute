import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { OpenChatSessionUseCase } from '../../application/use-cases/open-chat-session.use-case';
import { CloseChatSessionUseCase } from '../../application/use-cases/close-chat-session.use-case';
import { SendImageMessageUseCase } from '../../application/use-cases/send-image-message.use-case';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';
import { ChatGateway } from '../gateways/chat.gateway';
import { SenderRole } from '../../domain/enums/sender-role.enum';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly openSessionUseCase: OpenChatSessionUseCase,
    private readonly closeSessionUseCase: CloseChatSessionUseCase,
    private readonly sendImageUseCase: SendImageMessageUseCase,
    private readonly getHistoryUseCase: GetChatHistoryUseCase,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Abrir sesión de chat',
    description:
      'Crea una sesión de chat para un viaje. Disponible desde la reserva hasta finalizar la ruta.',
  })
  @ApiResponse({ status: 201, description: 'Sesión de chat creada' })
  async openSession(
    @Body()
    body: {
      tripId: string;
      driverId: string;
      passengerIds: string[];
    },
  ) {
    return this.openSessionUseCase.execute(body);
  }

  @Post('sessions/:sessionId/close')
  @ApiOperation({
    summary: 'Cerrar sesión de chat',
    description: 'Cierra la sesión al finalizar el viaje.',
  })
  async closeSession(@Param('sessionId') sessionId: string) {
    const session = await this.closeSessionUseCase.execute(sessionId);
    this.chatGateway.broadcastSessionClosed(session.tripId);
    return session;
  }

  @Get('trips/:tripId/history')
  @ApiOperation({
    summary: 'Historial de mensajes',
    description: 'Obtiene el historial paginado de mensajes de un viaje.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async getHistory(
    @Param('tripId') tripId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.getHistoryUseCase.execute({ tripId, limit, offset });
  }

  @Post('trips/:tripId/image')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  @ApiOperation({
    summary: 'Enviar imagen en el chat',
    description:
      'Sube una foto (desde galería o cámara) al chat del viaje. Formatos: JPG, PNG, WEBP, GIF. Máx 10 MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'senderId', 'senderRole'],
      properties: {
        file: { type: 'string', format: 'binary' },
        senderId: { type: 'string' },
        senderRole: { type: 'string', enum: ['DRIVER', 'PASSENGER'] },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen enviada exitosamente' })
  async sendImage(
    @Param('tripId') tripId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req()
    req: {
      body: { senderId: string; senderRole: string };
      user?: { id?: string };
    },
  ) {
    const senderId = req.user?.id ?? req.body.senderId;
    const senderRole = req.body.senderRole as SenderRole;

    const message = await this.sendImageUseCase.execute({
      tripId,
      senderId,
      senderRole,
      file,
    });

    this.chatGateway.broadcastNewImageMessage(tripId, {
      id: message.id,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      messageType: message.messageType,
      imageUrl: message.imageUrl,
      sentAt: message.sentAt,
    });

    return message;
  }
}
