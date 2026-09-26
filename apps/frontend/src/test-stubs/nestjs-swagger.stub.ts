/**
 * Stands in for `@nestjs/swagger` in the frontend's jest run.
 *
 * The shared DTOs in `@studio-lite-lib/api-dto` carry `@ApiProperty()` decorators so the api can
 * publish an OpenAPI document. A frontend spec that imports one of those DTOs therefore drags
 * the whole of Nest into a jsdom test -- and from version 12 on Nest is ES-module-only and uses
 * `import.meta`, which this CommonJS jest run cannot execute at all.
 *
 * Nothing in the frontend reads swagger metadata, so the decorators are replaced by ones that do
 * nothing. Mapped in `apps/frontend/jest.config.ts`.
 */
const noopPropertyDecorator = () => (): void => undefined;

export const ApiProperty = noopPropertyDecorator;
export const ApiPropertyOptional = noopPropertyDecorator;

/**
 * The real one builds a class carrying the swagger metadata of all its sources. Here only the
 * inheritance chain matters, since the DTOs that use it are extended and instantiated: the
 * returned class copies each source's own instance properties, and nothing else.
 */
export const IntersectionType = (...sources: (new () => unknown)[]): new () => unknown => {
  class Intersection {
    constructor() {
      sources.forEach(Source => Object.assign(this, new Source()));
    }
  }
  return Intersection;
};
