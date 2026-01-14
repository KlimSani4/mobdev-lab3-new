import { formatDate, formatPhone, generateId, getKarmaLevel } from '../utils/helpers';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = '2024-01-15T10:30:00.000Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('15');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('formatPhone', () => {
  it('formats phone number', () => {
    const phone = '9123456789';
    const formatted = formatPhone(phone);
    expect(formatted).toContain('912');
  });

  it('handles already formatted phone', () => {
    const phone = '+7 (912) 345-67-89';
    const formatted = formatPhone(phone);
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('returns string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });
});

describe('getKarmaLevel', () => {
  it('returns Новичок for low karma', () => {
    expect(getKarmaLevel(0)).toBe('Новичок');
    expect(getKarmaLevel(49)).toBe('Новичок');
  });

  it('returns Сосед for karma 50-199', () => {
    expect(getKarmaLevel(50)).toBe('Сосед');
    expect(getKarmaLevel(199)).toBe('Сосед');
  });

  it('returns Добряк for karma 200-499', () => {
    expect(getKarmaLevel(200)).toBe('Добряк');
    expect(getKarmaLevel(499)).toBe('Добряк');
  });

  it('returns Легенда подъезда for karma 500+', () => {
    expect(getKarmaLevel(500)).toBe('Легенда подъезда');
    expect(getKarmaLevel(1000)).toBe('Легенда подъезда');
  });
});
