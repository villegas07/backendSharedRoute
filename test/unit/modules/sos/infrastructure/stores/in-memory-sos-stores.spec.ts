import { InMemoryEmergencyContactStore } from '@/modules/sos/infrastructure/stores/in-memory-emergency-contact.store';
import { InMemorySosAlertStore } from '@/modules/sos/infrastructure/stores/in-memory-sos-alert.store';
import { EmergencyContactEntity } from '@/modules/sos/domain/entities/emergency-contact.entity';
import { SosAlertEntity } from '@/modules/sos/domain/entities/sos-alert.entity';
import { SosUserRole } from '@/modules/sos/domain/enums/sos-user-role.enum';

const makeContact = (userId = 'user-1', phone = '3001234567') =>
  EmergencyContactEntity.create({
    userId,
    name: 'Contacto Test',
    phone,
    relationship: 'Familiar',
  });

const makeAlert = (userId = 'driver-1') =>
  SosAlertEntity.create({
    userId,
    userRole: SosUserRole.DRIVER,
    tripId: 'trip-1',
    latitude: 4.711,
    longitude: -74.0721,
  });

describe('InMemoryEmergencyContactStore', () => {
  let store: InMemoryEmergencyContactStore;

  beforeEach(() => {
    store = new InMemoryEmergencyContactStore();
  });

  it('should save and find contact by id', async () => {
    const contact = makeContact();
    await store.save(contact);

    const found = await store.findById(contact.id);
    expect(found).toBe(contact);
  });

  it('should return null for unknown id', async () => {
    expect(await store.findById('x')).toBeNull();
  });

  it('should find all contacts by userId', async () => {
    await store.save(makeContact('user-1', '3001111111'));
    await store.save(makeContact('user-1', '3002222222'));
    await store.save(makeContact('user-2', '3003333333'));

    const contacts = await store.findByUserId('user-1');
    expect(contacts).toHaveLength(2);
    expect(contacts.every((c) => c.userId === 'user-1')).toBe(true);
  });

  it('should count contacts by userId', async () => {
    await store.save(makeContact('user-1', '3001111111'));
    await store.save(makeContact('user-1', '3002222222'));
    await store.save(makeContact('user-2', '3003333333'));

    expect(await store.countByUserId('user-1')).toBe(2);
    expect(await store.countByUserId('user-2')).toBe(1);
    expect(await store.countByUserId('user-3')).toBe(0);
  });

  it('should delete a contact', async () => {
    const contact = makeContact();
    await store.save(contact);
    await store.delete(contact.id);

    expect(await store.findById(contact.id)).toBeNull();
  });

  it('should return empty array when user has no contacts', async () => {
    expect(await store.findByUserId('no-contacts')).toEqual([]);
  });
});

describe('InMemorySosAlertStore', () => {
  let store: InMemorySosAlertStore;

  beforeEach(() => {
    store = new InMemorySosAlertStore();
  });

  it('should save and find alert by id', async () => {
    const alert = makeAlert();
    await store.save(alert);

    const found = await store.findById(alert.id);
    expect(found).toBe(alert);
  });

  it('should return null for unknown id', async () => {
    expect(await store.findById('x')).toBeNull();
  });

  it('should find active alerts by userId', async () => {
    const alert = makeAlert('driver-1');
    await store.save(alert);

    const results = await store.findActiveByUserId('driver-1');
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe('driver-1');
  });

  it('should not return resolved alerts in findActiveByUserId', async () => {
    const alert = makeAlert('driver-1');
    alert.resolve('admin-1');
    await store.save(alert);

    const results = await store.findActiveByUserId('driver-1');
    expect(results).toHaveLength(0);
  });

  it('should find all active alerts', async () => {
    const a1 = makeAlert('driver-1');
    const a2 = makeAlert('driver-2');
    const a3 = makeAlert('driver-3');
    a3.resolve('admin-1');

    await store.save(a1);
    await store.save(a2);
    await store.save(a3);

    const activeAlerts = await store.findAllActive();
    expect(activeAlerts).toHaveLength(2);
  });
});
