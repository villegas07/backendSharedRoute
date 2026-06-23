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

### Módulos disponibles
- **Auth** — Registro, login y gestión de tokens JWT
- **Users** — Gestión de perfiles de usuario
- **Vehicles** — Registro y administración de vehículos
- **Trips** — Publicación y búsqueda de viajes disponibles
- **Bookings** — Reservas de asientos en viajes

### Autenticación
Usa **Bearer JWT**. Obtén tu token en \`POST /api/v1/auth/login\` y agrégalo al header:
\`\`\`
Authorization: Bearer <token>
\`\`\`
      `,
    )
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
        description: 'Ingresa el token JWT obtenido en /auth/login',
      },
      'access-token',
    )
    .addTag('auth', 'Registro y autenticación de usuarios')
    .addTag('users', 'Gestión de perfiles de usuario')
    .addTag('vehicles', 'Registro y administración de vehículos')
    .addTag('trips', 'Publicación y búsqueda de viajes')
    .addTag('bookings', 'Reservas de asientos en viajes')
    .addTag('geolocation', 'Geolocalización y búsqueda de lugares con Google Maps')
    .addTag('navigation', 'Navegación en tiempo real con WebSockets y Google Directions')
    .addTag('chat', 'Chat en vivo entre conductor y pasajeros (texto + imágenes)')
    .addTag('sos', 'Módulo SOS: contactos de emergencia y alertas en tiempo real')
    .addTag('reviews', 'Calificaciones con emojis y comentarios entre conductor y pasajero')
    .addTag('trip-history', 'Historial de rutas realizadas para conductor y pasajero')
    .addTag('payments', 'Pagos de suscripciones con Wompi (pasarela de pagos colombiana)')
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
    },
    customSiteTitle: 'SharedRoute API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar-wrapper .link span { display: none; }
      .swagger-ui .topbar-wrapper::after { content: 'SharedRoute API'; color: white; font-size: 1.2rem; font-weight: bold; }
    `,
  });
}
