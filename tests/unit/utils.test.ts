import { describe, it, expect } from 'vitest';
import { colorFor, formatDate, filterUsersByName } from '../../src/utils';

// ---------------------------------------------------------------------------
// colorFor — deterministic avatar background color
// ---------------------------------------------------------------------------
describe('colorFor', () => {
  it('returns a hex color string', () => {
    const result = colorFor('Alice');
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('is deterministic — same input always returns the same color', () => {
    const a = colorFor('JaneDoe');
    const b = colorFor('JaneDoe');
    expect(a).toBe(b);
  });

  it('returns different colors for different names (most cases)', () => {
    // Not guaranteed for every pair, but distinct for these well-separated names
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const colors = names.map(colorFor);
    const unique = new Set(colors);
    // At least two distinct colors among five different names
    expect(unique.size).toBeGreaterThan(1);
  });

  it('handles an empty string without throwing', () => {
    expect(() => colorFor('')).not.toThrow();
  });

  it('returns a value from the defined palette (one of 10 known hex codes)', () => {
    const palette = new Set([
      '#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
    ]);
    for (const name of ['Alice', 'Bob', 'X', '123', 'test@example.com']) {
      expect(palette.has(colorFor(name))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// formatDate — Unix timestamp → human date string
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats a known timestamp correctly', () => {
    // 2023-11-14 (UTC): 1699920000
    const result = formatDate(1699920000);
    expect(result).toContain('2023');
    expect(result).toMatch(/Nov/);
  });

  it('returns a non-empty string for any valid timestamp', () => {
    expect(formatDate(0)).toBeTruthy();       // 1970-01-01
    expect(formatDate(1000000000)).toBeTruthy(); // 2001
    expect(formatDate(2000000000)).toBeTruthy(); // 2033
  });

  it('includes day, month abbreviation, and year', () => {
    const result = formatDate(1700000000); // approx Nov 14, 2023
    // Should contain a numeric year and a 3-letter month
    expect(result).toMatch(/\d{4}/);        // year
    expect(result).toMatch(/[A-Z][a-z]{2}/); // Mon abbreviation
  });
});

// ---------------------------------------------------------------------------
// filterUsersByName — case-insensitive name search
// ---------------------------------------------------------------------------
describe('filterUsersByName', () => {
  const users = [
    { id: 1, first: 'Alice', last: 'Anderson' },
    { id: 2, first: 'Bob', last: 'Brown' },
    { id: 3, first: 'Charlie', last: 'Clark' },
    { id: 4, first: 'Diana', last: 'Davis' },
  ];

  it('returns all users when query is empty', () => {
    expect(filterUsersByName(users, '')).toHaveLength(4);
  });

  it('returns all users when query is whitespace only', () => {
    expect(filterUsersByName(users, '   ')).toHaveLength(4);
  });

  it('filters by first name (case-insensitive)', () => {
    const result = filterUsersByName(users, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].first).toBe('Alice');
  });

  it('filters by last name (case-insensitive)', () => {
    const result = filterUsersByName(users, 'BROWN');
    expect(result).toHaveLength(1);
    expect(result[0].first).toBe('Bob');
  });

  it('filters by partial match across full name', () => {
    const result = filterUsersByName(users, 'lie cl');
    expect(result).toHaveLength(1);
    expect(result[0].first).toBe('Charlie');
  });

  it('returns an empty array when no user matches', () => {
    const result = filterUsersByName(users, 'xyz');
    expect(result).toHaveLength(0);
  });

  it('returns multiple results when the query matches several users', () => {
    // Both "Anderson" and "Alice" contain 'a'
    const result = filterUsersByName(users, 'a');
    expect(result.length).toBeGreaterThan(1);
  });

  it('works on an empty user list', () => {
    expect(filterUsersByName([], 'alice')).toHaveLength(0);
  });

  it('preserves object identity (same references returned)', () => {
    const result = filterUsersByName(users, 'bob');
    expect(result[0]).toBe(users[1]);
  });
});
