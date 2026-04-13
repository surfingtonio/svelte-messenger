// ---------------------------------------------------------------------------
// Pure utility functions — isolated here to allow unit testing without Svelte
// ---------------------------------------------------------------------------

const AVATAR_PALETTE = [
  '#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

/**
 * Maps a name string to a deterministic color from the avatar palette.
 * Same name always produces the same color; different names typically differ.
 */
export function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

/**
 * Format a Unix timestamp (seconds) as a human-readable date string.
 * Example: 1_700_000_000 → "Nov 14, 2023"
 */
export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Filter a list of users by a case-insensitive name search.
 * Returns all users when query is empty/whitespace.
 */
export function filterUsersByName<T extends { first: string; last: string }>(
  users: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return users;
  return users.filter((u) =>
    `${u.first} ${u.last}`.toLowerCase().includes(q)
  );
}
