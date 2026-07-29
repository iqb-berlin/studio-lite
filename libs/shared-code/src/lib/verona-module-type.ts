/**
 * Verona module type identifiers.
 *
 * The Verona module metadata specification moved to upper-case type identifiers
 * (EDITOR, PLAYER, SCHEMER, WIDGET). Modules published before that change still
 * ship the historical lower-case spelling (editor, player, schemer). Both spellings
 * must therefore stay valid throughout studio-lite: newly emitted type strings use
 * the canonical upper-case form, while every comparison against a module's stored
 * `metadata.type` is done case-insensitively via veronaModuleTypesMatch.
 *
 * These helpers are kept in shared-code (rather than on the swagger-decorated
 * VeronaModuleMetadataDto) so the frontend can call them without bundling
 * `@nestjs/swagger`.
 */

// Canonical (upper-case) module types as defined by the current Verona module metadata spec.
export const VERONA_MODULE_TYPES = ['EDITOR', 'PLAYER', 'SCHEMER', 'WIDGET'] as const;

// Reduces a module type to its canonical (upper-case, trimmed) form so that the historical
// lower-case spelling and the current upper-case spec spelling can be compared interchangeably.
export function normalizeVeronaModuleType(type?: string | null): string {
  return (type ?? '').trim().toUpperCase();
}

// Case-insensitive comparison of two module types (e.g. 'editor' matches 'EDITOR').
export function veronaModuleTypesMatch(a?: string | null, b?: string | null): boolean {
  return normalizeVeronaModuleType(a) === normalizeVeronaModuleType(b);
}

// Whether the given type is one of the four known Verona module types (in any casing).
export function isKnownVeronaModuleType(type?: string | null): boolean {
  return VERONA_MODULE_TYPES.some(known => veronaModuleTypesMatch(known, type));
}
