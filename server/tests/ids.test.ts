import { formatDueDate, parseDueDate, parsePublicId, toPublicId } from '../src/lib/ids';

describe('IDs', () => {
  it('formats IDs with their resource prefix', () => {
    expect(toPublicId('task', 12)).toBe('task-12');
  });

  it('parses integer numbers and rejects unsupported values', () => {
    expect(parsePublicId(12)).toBe(12);
    expect(parsePublicId(1.5)).toBeNull();
    expect(parsePublicId(null)).toBeNull();
    expect(parsePublicId('  ')).toBeNull();
  });

  it('parses numeric and prefixed IDs, validating their values and prefix', () => {
    expect(parsePublicId(' 12 ')).toBe(12);
    expect(parsePublicId('task-12', 'task')).toBe(12);
    expect(parsePublicId('task-12')).toBe(12);
    expect(parsePublicId('0')).toBeNull();
    expect(parsePublicId('bad')).toBeNull();
    expect(parsePublicId('proj-12', 'task')).toBeNull();
    expect(parsePublicId('task-bad', 'task')).toBeNull();
    expect(parsePublicId('task-0', 'task')).toBeNull();
  });
});

describe('due dates', () => {
  it('parses null and valid date strings, rejecting other values', () => {
    expect(parseDueDate(null)).toBeNull();
    expect(parseDueDate('2026-10-06')).toEqual(new Date('2026-10-06'));
    expect(parseDueDate(20261006)).toBeUndefined();
    expect(parseDueDate('06-10-2026')).toBeUndefined();
    expect(parseDueDate('2026-99-99')).toBeUndefined();
  });

  it('formats dates as padded calendar days and preserves null', () => {
    expect(formatDueDate(null)).toBeNull();
    expect(formatDueDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});