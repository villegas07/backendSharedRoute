import { BaseEntity } from '@/domain/entities/base.entity';

class TestEntity extends BaseEntity {
  name: string;
  constructor(name: string, id?: string) {
    super(id);
    this.name = name;
  }
}

describe('BaseEntity', () => {
  it('should auto-generate an id when none is provided', () => {
    const entity = new TestEntity('test');
    expect(entity.id).toBeDefined();
    expect(entity.id.length).toBeGreaterThan(0);
  });

  it('should use the provided id', () => {
    const entity = new TestEntity('test', 'custom-id');
    expect(entity.id).toBe('custom-id');
  });

  it('should set createdAt and updatedAt on creation', () => {
    const entity = new TestEntity('test');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should return true for equals when ids match', () => {
    const a = new TestEntity('a', 'same-id');
    const b = new TestEntity('b', 'same-id');
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for equals when ids differ', () => {
    const a = new TestEntity('a', 'id-1');
    const b = new TestEntity('b', 'id-2');
    expect(a.equals(b)).toBe(false);
  });

  it('touch() should update updatedAt', () => {
    const entity = new TestEntity('test');
    const before = entity.updatedAt;
    entity.touch();
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
