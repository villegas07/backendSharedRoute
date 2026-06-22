import { randomUUID } from 'crypto';

export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;

  protected constructor(id?: string) {
    this.id = id ?? randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  equals(entity: BaseEntity): boolean {
    return this.id === entity.id;
  }

  touch(): void {
    this.updatedAt = new Date();
  }
}
