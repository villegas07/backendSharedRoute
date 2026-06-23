import { DomainException } from '@/domain/exceptions/domain.exception';

describe('DomainException', () => {
  it('should create with message and code', () => {
    const ex = new DomainException('Something went wrong', 'DOMAIN_ERROR');
    expect(ex.message).toBe('Something went wrong');
    expect(ex.code).toBe('DOMAIN_ERROR');
    expect(ex.name).toBe('DomainException');
  });

  it('should be an instance of Error', () => {
    const ex = new DomainException('msg', 'CODE');
    expect(ex).toBeInstanceOf(Error);
  });
});
