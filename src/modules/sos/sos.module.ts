import { Module } from '@nestjs/common';
import { EmergencyContactRepository } from './domain/ports/emergency-contact.repository';
import { SosAlertRepository } from './domain/ports/sos-alert.repository';
import { SosNotificationPort } from './domain/ports/sos-notification.port';
import { InMemoryEmergencyContactStore } from './infrastructure/stores/in-memory-emergency-contact.store';
import { InMemorySosAlertStore } from './infrastructure/stores/in-memory-sos-alert.store';
import { StubSosNotificationAdapter } from './infrastructure/adapters/stub-sos-notification.adapter';
import { RegisterEmergencyContactUseCase } from './application/use-cases/register-emergency-contact.use-case';
import { GetEmergencyContactsUseCase } from './application/use-cases/get-emergency-contacts.use-case';
import { DeleteEmergencyContactUseCase } from './application/use-cases/delete-emergency-contact.use-case';
import { TriggerSosAlertUseCase } from './application/use-cases/trigger-sos-alert.use-case';
import { ResolveSosAlertUseCase } from './application/use-cases/resolve-sos-alert.use-case';
import { SosGateway } from './presentation/gateways/sos.gateway';
import { SosController } from './presentation/controllers/sos.controller';

@Module({
  controllers: [SosController],
  providers: [
    { provide: EmergencyContactRepository, useClass: InMemoryEmergencyContactStore },
    { provide: SosAlertRepository, useClass: InMemorySosAlertStore },
    { provide: SosNotificationPort, useClass: StubSosNotificationAdapter },
    RegisterEmergencyContactUseCase,
    GetEmergencyContactsUseCase,
    DeleteEmergencyContactUseCase,
    TriggerSosAlertUseCase,
    ResolveSosAlertUseCase,
    SosGateway,
  ],
  exports: [SosGateway],
})
export class SosModule {}
