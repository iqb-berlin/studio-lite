# Project Rules & Best Practices

## General Frontend Rules

### Internationalization (i18n)
- **Rule**: Every user-facing text (German/English) in the frontend MUST be managed through translation keys in `assets/i18n/de.json` (and `en.json` if available).
- **Rationale**: Hardcoded strings are strictly forbidden as they prevent proper localization and make the codebase harder to maintain.
- **Preferred Solution**: Use the `translate` pipe in templates or the `TranslateService` in components to retrieve localized strings.

## TypeScript & Angular

### Performance: Template Bindings
- **Rule**: Avoid binding functions or getters directly in Angular templates (e.g., `[checked]="isRouteHidden('editor')"`). 
- **Important**: This also applies to array methods like `[].includes()` or `[].some()` and the creation of object/array literals within the template (e.g., `[class.x]="['a', 'b'].includes(v)"`).
- **Rationale**: Direct function calls in templates are executed on every change detection cycle, which can severely impact performance.
- **Preferred Solution (Pipes)**: Use **Pure Pipes** for data transformation in templates (e.g., `[navTabs]="navTabs | filterHiddenTabs:hiddenRoutes"`).
  - Pure pipes are only re-evaluated when their input references change, providing built-in memoization.

### Subscription Management
- **Rule**: Use the `ngUnsubscribe` + `takeUntil` pattern for all subscriptions in Angular components.
- **Rationale**: This ensures that subscriptions are automatically cleaned up when a component is destroyed, preventing memory leaks and unexpected behavior from asynchronous callbacks.
- **Preferred Solution**:
  - Define `private ngUnsubscribe = new Subject<void>();` as a class property.
  - Use `.pipe(takeUntil(this.ngUnsubscribe))` consistently before calling `.subscribe()`.
  - Implement `OnDestroy` and emit a value to `ngUnsubscribe` in `ngOnDestroy()`:
    ```typescript
    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
    ```

### Unit Testing: Asynchronous Tests
- **Rule**: Prefer `fakeAsync` and `tick()` over `async/await` with `setTimeout` or manual `wait()` helpers for testing asynchronous logic.
- **Rationale**: 
  - `fakeAsync` allows for synchronous-like control over virtual time, making tests significantly faster by not actually waiting for real time to pass.
  - It prevents "Exceeded timeout" errors in CI environments, which are often caused by slow execution or high resource contention.
  - Manual `wait()` functions (using `setTimeout`) make tests non-deterministic and hard to maintain.
- **Implementation**:
    ```typescript
    it('should handle async logic', fakeAsync(() => {
      component.doSomethingAsync();
      tick(200); // Advance virtual time by 200ms
      fixture.detectChanges();
      expect(component.result).toBe(true);
    }));
    ```

### Modern Angular Control Flow
- **Rule**: Use the built-in control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives like `*ngIf`, `*ngFor`, or `*ngSwitch`.
- **Rationale**: The new control flow is more efficient, type-safe, and reduces the need for `CommonModule`.

### No $any() in Templates
- **Rule**: Avoid using `$any()` in templates to bypass type checking.
- **Rationale**: `$any()` is the template equivalent of `any` in TypeScript and defeats the purpose of type-safe templates.
- **Preferred Solution**: Use a custom `cast` pipe or a dedicated getter in the component to provide typed access to complex structures (like `FormGroup` within a `FormArray`).
### Unit Testing Policy
- **New Classes**: Every new Angular or NestJS class (e.g., Pipes, Components, Services, Guards, Controllers) MUST have a corresponding `.spec.ts` file with comprehensive unit tests.
- **Logic Changes**: Any modification to existing business logic or security flows MUST be accompanied by corresponding updates to the unit tests to verify the new behavior and prevent regressions.
- **Public Members**: Adding or modifying any public method or property MUST trigger the creation or update of corresponding unit tests to ensure full coverage of the public interface.
- **Mocking**: Use `createMock<T>()` from `@golevelup/ts-jest` for NestJS tests to ensure type-safe mocking.


### Type Safety: Avoid `any`
- **Rule**: Do NOT use the `any` type.
- **Rationale**: `any` disables TypeScript's type checking, leading to runtime errors and making the codebase harder to maintain.
- **Solution**: 
  - Use specific DTOs or interfaces from `@studio-lite-lib/api-dto`.
  - Use structural typing (e.g., `{ id: number; name: string }`) when a full interface isn't available.
  - Use `unknown` with type guards if the type is truly dynamic.
  - In unit tests, use `createMock<T>()` from `@golevelup/ts-jest` to create properly typed mocks (e.g., `createMock<Workspace>({ groupId: 2 })`). This is the preferred approach over object literals with `as any` or `as unknown as Type`.
- **Rule**: NEVER use `// @ts-ignore` or `// @ts-nocheck`.
  - **Rationale**: These suppressions hide potential bugs and architecture flaws instead of fixing them.
  - **Solution**: Adjust types, interfaces, or mock data to satisfy the compiler properly.

### Component Structure
- **Rule**: Every Angular component MUST reside in its own dedicated directory.
- **Rule**: Every component MUST be split into four separate files:
    - `[component-name].component.ts` (Logic/Class)
    - `[component-name].component.html` (Template)
    - `[component-name].component.scss` (Styles)
    - `[component-name].component.spec.ts` (Unit Tests)
- **Rule**: These component directories MUST be located within the `components` subdirectory of their respective Angular module.
- **Rationale**: This ensures a clean separation of concerns, consistent project structure, and improved maintainability.

### Deprecations
- **Rule**: Do NOT use `NoopAnimationsModule` or `BrowserAnimationsModule`.
  - **Rationale**: They are deprecated in this project and can be removed from component tests without replacement.
- **Rule**: Do NOT use `HttpClientTestingModule`.
  - **Rationale**: Use `provideHttpClient()` and `provideHttpClientTesting()` instead.

### CSS & Styling
- **Rule**: Avoid using element or attribute selectors (e.g., `button[mat-stroked-button]`, `mat-icon`) in SCSS files.
- **Preferred Solution**: Use explicit, descriptive classes (e.g., `.add-url-button`, `.button-icon`) to target elements.
- **Rationale**: Explicit classes are less fragile when the underlying library (e.g., Angular Material) changes its internal tag or attribute structure.

## NestJS & Backend

### ORM Usage: TypeORM
- **Rule**: Prefer TypeORM's built-in Repository methods (e.g., `find`, `save`, `queryBuilder`) over raw SQL queries.
- **Rationale**: Using the ORM's abstraction layer ensures better type safety, prevents SQL injection, and makes the code more readable and maintainable. Raw SQL should ONLY be used for extremely complex queries where the ORM reaches its limits.
- **Implementation**: Ensure that entities have proper relations (e.g., `@ManyToOne`, `@OneToMany`) defined to use the `relations` option in repository methods.
