import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_PATH = 'api/docs';

export function buildSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('SharedRoute API')
    .setDescription('API backend de SharedRoute — plataforma de carpooling colombiana.')
    .setVersion('1.0')
    .setContact('SharedRoute Team', '', 'soporte@sharedroute.app')
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
      docExpansion: 'list',
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

