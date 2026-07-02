import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1719878400000 implements MigrationInterface {
  name = 'InitialSchema1719878400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('DRIVER', 'PASSENGER', 'ADMIN')
    `);
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL,
        "status" "user_status_enum" NOT NULL DEFAULT 'PENDING_VERIFICATION',
        "profilePhotoUrl" character varying,
        "averageRating" double precision NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token"),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_password_reset_tokens_token" UNIQUE ("token"),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "vehicle_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_INSPECTION')
    `);
    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" character varying NOT NULL,
        "ownerId" character varying NOT NULL,
        "brand" character varying NOT NULL,
        "model" character varying NOT NULL,
        "year" integer NOT NULL,
        "plate" character varying NOT NULL,
        "color" character varying NOT NULL,
        "totalSeats" integer NOT NULL,
        "status" "vehicle_status_enum" NOT NULL DEFAULT 'PENDING_INSPECTION',
        "photoUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vehicles_plate" UNIQUE ("plate"),
        CONSTRAINT "PK_vehicles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "trip_status_enum" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TABLE "trips" (
        "id" character varying NOT NULL,
        "driverId" character varying NOT NULL,
        "vehicleId" character varying NOT NULL,
        "originLatitude" double precision NOT NULL,
        "originLongitude" double precision NOT NULL,
        "originAddress" character varying NOT NULL,
        "originCity" character varying NOT NULL,
        "destinationLatitude" double precision NOT NULL,
        "destinationLongitude" double precision NOT NULL,
        "destinationAddress" character varying NOT NULL,
        "destinationCity" character varying NOT NULL,
        "departureAt" TIMESTAMP NOT NULL,
        "availableSeats" integer NOT NULL,
        "pricePerSeat" double precision NOT NULL,
        "status" "trip_status_enum" NOT NULL DEFAULT 'DRAFT',
        "notes" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trips" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED_BY_PASSENGER', 'CANCELLED_BY_DRIVER', 'COMPLETED')
    `);
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" character varying NOT NULL,
        "tripId" character varying NOT NULL,
        "passengerId" character varying NOT NULL,
        "seatsReserved" integer NOT NULL,
        "totalPrice" double precision NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM ('SOAT', 'LICENSE', 'CEDULA')
    `);
    await queryRunner.query(`
      CREATE TYPE "document_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED')
    `);
    await queryRunner.query(`
      CREATE TABLE "driver_documents" (
        "id" character varying NOT NULL,
        "driverId" character varying NOT NULL,
        "vehicleId" character varying,
        "type" "document_type_enum" NOT NULL,
        "fileUrl" character varying NOT NULL,
        "fileOriginalName" character varying NOT NULL,
        "identificationNumber" character varying,
        "expiresAt" TIMESTAMP,
        "status" "document_status_enum" NOT NULL DEFAULT 'PENDING',
        "reviewNote" character varying,
        "reviewedBy" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_driver_documents" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "plan_type_enum" AS ENUM ('HOURS_24', 'DAYS', 'MONTHLY')
    `);
    await queryRunner.query(`
      CREATE TABLE "subscription_plans" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "type" "plan_type_enum" NOT NULL,
        "durationHours" integer NOT NULL,
        "price" double precision NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "subscription_status_enum" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" character varying NOT NULL,
        "driverId" character varying NOT NULL,
        "planId" character varying NOT NULL,
        "planName" character varying NOT NULL,
        "startAt" TIMESTAMP NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "status" "subscription_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
      )
    `);

    // Indexes for common lookups
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_tokens_userId" ON "password_reset_tokens" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_vehicles_ownerId" ON "vehicles" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_trips_driverId" ON "trips" ("driverId")`);
    await queryRunner.query(`CREATE INDEX "IDX_trips_status" ON "trips" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_tripId" ON "bookings" ("tripId")`);
    await queryRunner.query(`CREATE INDEX "IDX_bookings_passengerId" ON "bookings" ("passengerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_driver_documents_driverId" ON "driver_documents" ("driverId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_driverId" ON "subscriptions" ("driverId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "driver_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trips"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "plan_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "trip_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
