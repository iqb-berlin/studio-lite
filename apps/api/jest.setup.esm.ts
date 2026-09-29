// In ESM mode Jest no longer injects the `jest` object as a global -- it has to be imported
// from '@jest/globals'. Rather than adding that import to every spec file, it is put back on
// globalThis here, so the existing `jest.fn()` / `jest.spyOn()` calls keep working.
import { jest } from '@jest/globals';

(globalThis as unknown as { jest: typeof jest }).jest = jest;
