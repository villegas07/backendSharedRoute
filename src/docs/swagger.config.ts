import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_PATH = 'api/docs';

export function buildSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('SharedRoute API')
    .setDescription(
      `
## SharedRoute — Backend API

Plataforma de carpooling que conecta conductores y pasajeros para compartir viajes.

---

### Módulos disponibles

| Módulo | Descripción |
|--------|-------------|
| **auth** | Registro, login y gestión de tokens JWT |
| **users** | CRUD de perfiles de usuario |
| **vehicles** | CRUD de vehículos del conductor |
| **trips** | Publicación, búsqueda y gestión de viajes |
| **bookings** | Reservas de asientos + cancelación |
| **documents** | Subida y revisión de SOAT, Licencia y Cédula |
| **subscriptions** | Planes y gestión de suscripciones del conductor |
| **geolocation** | Geocodificación y búsqueda de lugares (Google Maps) |
| **navigation** | Navegación en tiempo real vía WebSocket (/navigation) |
| **chat** | Chat en vivo texto + imágenes vía WebSocket (/chat) |
| **sos** | Alertas de emergencia y contactos de emergencia |
| **reviews** | Calificaciones con emojis entre conductor y pasajero |
| **trip-history** | Historial de rutas paginado y filtrable |
| **payments** | Checkout de suscripciones con Wompi |
| **support** | Tickets de soporte con chat integrado |

---

### Autenticación
Usa **Bearer JWT**. Obtén tu token en \`POST /api/v1/auth/login\` y agrégalo al header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### WebSockets
- **Chat en vivo:** \`ws://<host>/chat\` — eventos: \`chat:join\`, \`chat:send-message\`, \`chat:typing\`, \`chat:history\`, \`chat:new-message\`
- **Navegación:** \`ws://<host>/navigation\` — eventos: \`join-session\`, \`driver:update-location\`, \`driver:navigation-update\`, \`passenger:location-update\`
- **SOS:** \`ws://<host>/sos\` — eventos: \`sos:alert-triggered\`, \`sos:alert-resolved\`

### Reglas de negocio clave
- El conductor debe tener **SOAT + Licencia + Cédula aprobados** antes de comprar una suscripción.
- Solo los conductores con **suscripción activa** pueden publicar viajes.
- Las **calificaciones** solo se pueden enviar cuando el viaje está **COMPLETADO**.
- El **webhook de Wompi** valida la firma HMAC-SHA256 antes de procesar cualquier evento.
      `,
    )
    .setVersion('1.0')
    .setContact('SharedRoute Team', 'https://sharedroute.app', 'soporte@sharedroute.app')
    .setLicense('UNLICENSED', '')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
        description: 'Token JWT obtenido en POST /api/v1/auth/login',
      },
      'access-token',
    )
    .addTag('auth', 'Registro, login y gestión de tokens JWT')
    .addTag('users', 'CRUD completo de perfiles de usuario')
    .addTag('vehicles', 'CRUD completo de vehículos del conductor')
    .addTag('trips', 'Publicación, búsqueda, actualización y cancelación de viajes')
    .addTag('bookings', 'Reservas de asientos y cancelación')
    .addTag('documents', 'Subida, revisión y eliminación de documentos del conductor')
    .addTag('subscriptions', 'Planes de suscripción y gestión de suscripciones')
    .addTag('geolocation', 'Geocodificación inversa y búsqueda de lugares (Google Maps)')
    .addTag('navigation', 'Navegación turn-by-turn en tiempo real (REST + WebSocket)')
    .addTag('chat', 'Chat en vivo con texto e imágenes (REST + WebSocket)')
    .addTag('sos', 'Alertas SOS y gestión de contactos de emergencia')
    .addTag('reviews', 'Calificaciones con emojis y comentarios (solo viajes completados)')
    .addTag('trip-history', 'Historial de rutas paginado para conductor y pasajero')
    .addTag('payments', 'Checkout de suscripciones con Wompi + webhook')
    .addTag('support', 'Tickets de soporte con chat integrado')
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  const document = buildSwaggerDocument(app);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'SharedRoute API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar-wrapper .link span { display: none; }
      .swagger-ui .topbar-wrapper::after { content: 'SharedRoute API'; color: white; font-size: 1.2rem; font-weight: bold; }
      .swagger-ui .info .title { color: #1a1a2e; }
    `,
  });
}

