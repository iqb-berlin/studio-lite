/**
 * Whether a text is a coding scheme the studio stores: JSON with a list of variable codings. The scheme
 * endpoint refuses anything else (`UnitDefinitionService.patchScheme`); the import asks the same, so that
 * it reports such a scheme instead of failing the whole upload (#1986).
 */
export function isCodingScheme(text: string): boolean {
  try {
    return Array.isArray(JSON.parse(text)?.variableCodings);
  } catch {
    return false;
  }
}
