import { InMemorySupportTicketStore } from '@/modules/support/infrastructure/stores/in-memory-support-ticket.store';
import { SupportTicketEntity } from '@/modules/support/domain/entities/support-ticket.entity';
import { SupportCategory } from '@/modules/support/domain/enums/support-category.enum';
import { SupportTicketStatus } from '@/modules/support/domain/enums/support-ticket-status.enum';

const makeTicket = (userId = 'user-1') =>
  SupportTicketEntity.create({
    userId,
    category: SupportCategory.APP_BUG,
    subject: 'Bug en pantalla de pagos',
    description: 'La pantalla de pagos no carga correctamente desde el sábado.',
  });

describe('InMemorySupportTicketStore', () => {
  let store: InMemorySupportTicketStore;

  beforeEach(() => {
    store = new InMemorySupportTicketStore();
  });

  it('should save and find by id', async () => {
    const ticket = makeTicket();
    await store.save(ticket);
    expect(await store.findById(ticket.id)).toBe(ticket);
  });

  it('should return null for unknown id', async () => {
    expect(await store.findById('x')).toBeNull();
  });

  it('should find all tickets for a user', async () => {
    await store.save(makeTicket('user-1'));
    await store.save(makeTicket('user-1'));
    await store.save(makeTicket('user-2'));

    const result = await store.findByUserId('user-1');
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.userId === 'user-1')).toBe(true);
  });

  it('should return empty array for user with no tickets', async () => {
    expect(await store.findByUserId('no-user')).toEqual([]);
  });

  it('should find all OPEN and IN_PROGRESS tickets', async () => {
    const t1 = makeTicket('user-1');
    const t2 = makeTicket('user-2');
    const t3 = makeTicket('user-3');
    t3.resolve();

    await store.save(t1);
    await store.save(t2);
    await store.save(t3);

    const open = await store.findAllOpen();
    expect(open).toHaveLength(2);
    expect(open.every((t) => t.isOpen())).toBe(true);
  });

  it('should overwrite ticket on re-save', async () => {
    const ticket = makeTicket();
    await store.save(ticket);
    ticket.resolve();
    await store.save(ticket);

    const found = await store.findById(ticket.id);
    expect(found?.status).toBe(SupportTicketStatus.RESOLVED);
  });
});
