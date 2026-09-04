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

### Avoid Loops in Favor of Array Iterations
- **Rule**: Avoid standard loops (`for`, `for...of`, `for...in`, `while`) in favor of functional array iteration methods (e.g., `forEach`, `map`, `filter`, `some`, `every`, `reduce`).
- **Rationale**: Functional array methods are less error-prone, promote immutability, and improve readability. Standard loops trigger the linter rule `no-restricted-syntax`.
- **Preferred Solution**:
  - Use `forEach` for simple iterations without early termination.
  - Use `some` or `every` if you need to terminate early (equivalent to `break` or `continue` respectively).
  - Use `map`, `filter`, `reduce` for data transformation.

### Component Structure
- **Rule**: Every Angular component MUST reside in its own dedicated directory.
- **Rule**: Every component MUST be split into four separate files:
    - `[component-name].component.ts` (Logic/Class)
    - `[component-name].component.html` (Template)
    - `[component-name].component.scss` (Styles)
    - `[component-name].component.spec.ts` (Unit Tests)
- **Rule**: These component directories MUST be located within the `components` subdirectory of their respective Angular module.
- **Rationale**: This ensures a clean separation of concerns, consistent project structure, and improved maintainability.

### Responsibility: Work That Is Not the Class's Job
- **Rule**: A service, component or directive holds the work its name promises. A body that answers a different question — an algorithm, a file format, a set of domain rules — becomes a class or function of its own beside it and is called by name. What stays behind is the seam: the few lines that decide when the other one is asked and what is done with its answer.
- **Marks** (any one is enough):
  - The body needs nothing from the class it sits in: no `this`, no injected dependency, no field, no template, no host element.
  - You can say what it does without naming its host's job.
  - Private members exist only to serve one public method — they are that unit's insides, and only private to the wrong class.
- **Not this**: a helper of a few lines that reads the state around it. The rule is aimed at the body that grew until it needs explaining, not at "one method per class".
- **Preferred Solution**:
  - Computation without dependencies → a class or function in `utils/` (both the frontend and the API have one).
  - Needs injection or holds shared state → its own service.
  - A value computed for a template → a **pure pipe** (see *Performance: Template Bindings*).
  - Each of them gets its own `.spec.ts` (see *Unit Testing Policy*), and the caller keeps a test that it actually reaches for it.
- **Rationale**: A class that answers two questions can only be tested through both, and its two halves rarely change at the same time — every change to one of them re-reads a class it has no business in.

### Splitting a Component: Child, Directive, Base Class
- **Rule**: Foreign work leaves first (see above). What remains is view work, and it is split in this order — cheapest and most reversible first, inheritance last:
  1. **Too much view → a child component.** The plainest case is the body of a `@for`: what the loop renders per entry already is one thing with a name, its data already arrives as one value per pass (its inputs) and its events already have to travel upwards (its outputs). `CommentsComponent` renders one `<studio-lite-comment>` per root comment, and `CommentComponent` renders its replies with itself, one level down; it decides nothing — delete, reply, vote, hide all go back up to the component that owns the discussion.
  2. **Behaviour at the host element → an applied directive**, with a selector: `ScrollCommentIntoViewDirective`, `ScrollIntoViewDirective`, `TrackIframeActivityDirective`. The mark is that it hangs on an element rather than on the data flow, and that a second element should be able to have it by writing an attribute — without touching that element's class, which is exactly what a base class would demand.
  3. **A shared role → an abstract base class**, written `@Directive()` **without a selector**, and only for "is a" — never merely to share code. Everything the base holds must be something every subclass needs; where only some of them need it, add a step rather than a member: `VeronaModuleDirective` → `UnitDefinitionDirective` → `PreviewDirective`, inherited by `UnitPreviewComponent`, `UnitPlayerComponent` and `UnitPrintPlayerComponent`.
- **Not this**: length alone. A loop body of one element with two bindings stays where it is, and a child that holds nothing but a stretch of markup, with nothing crossing the boundary but the parent's own fields, spreads one view over two places without separating anything. A child costs four files (see *Component Structure*) and an entry in the parent's `imports`.
- **Note**: four bases here (`PreviewDirective`, `UnitDefinitionDirective`, `VeronaModuleDirective`, `CheckForChangesDirective`) still carry a selector that no template uses and that could not do anything anyway, since an abstract class is never instantiated. Do not copy that — a base class gets no selector.
- **Rationale**: The reflex is a helper class, and it leaves untouched what is usually too big about a component: its view. Inheritance is last because it is the one split that cannot be undone in a single file.

### Deprecations
- **Rule**: Do NOT use `NoopAnimationsModule` or `BrowserAnimationsModule`.
  - **Rationale**: They are deprecated in this project and can be removed from component tests without replacement.
- **Rule**: Do NOT use `HttpClientTestingModule`.
  - **Rationale**: Use `provideHttpClient()` and `provideHttpClientTesting()` instead.

### Line Length
- **Rule**: Lines must not exceed 120 characters (`max-len`).
- **Rationale**: Enforced by ESLint; JetBrains and CI both flag violations.
- **Preferred Solution**: When a function call exceeds 120 characters, place **each argument on its own line** — grouping multiple arguments per line violates `function-call-argument-newline` (all-or-nothing rule). For imports, use the multiline form:
  ```typescript
  import {
    TokenA, TokenB, TokenC
  } from 'some-module';
  ```

### CSS & Styling
- **Rule**: Avoid using element or attribute selectors (e.g., `button[mat-stroked-button]`, `mat-icon`) in SCSS files.
- **Preferred Solution**: Use explicit, descriptive classes (e.g., `.add-url-button`, `.button-icon`) to target elements.
- **Rationale**: Explicit classes are less fragile when the underlying library (e.g., Angular Material) changes its internal tag or attribute structure.

## NestJS & Backend

### ORM Usage: TypeORM
- **Rule**: Prefer TypeORM's built-in Repository methods (e.g., `find`, `save`, `queryBuilder`) over raw SQL queries.
- **Rationale**: Using the ORM's abstraction layer ensures better type safety, prevents SQL injection, and makes the code more readable and maintainable. Raw SQL should ONLY be used for extremely complex queries where the ORM reaches its limits.
- **Implementation**: Ensure that entities have proper relations (e.g., `@ManyToOne`, `@OneToMany`) defined to use the `relations` option in repository methods.

### Controllers and Services: Where the Work Goes
- **Rule**: A controller takes the request, applies its guards and calls a service. The business logic belongs in the service, not in the controller.
- **Rule**: A task that is not the service's own subject — producing a file format, parsing an import, a question two callers have to answer identically — becomes a class in `classes/` or a function in `utils/`, and the service or controller calls it by name. This is the backend half of *Responsibility: Work That Is Not the Class's Job*.
- **Examples**:
  - `UnitDownloadClass`, `DownloadWorkspacesClass` and `DownloadDocx` build what is downloaded; the controllers hand them the data and return the result.
  - `UnitImportData` and `UnitImportJsonData` read the import formats for `WorkspaceService`.
  - `findOrphanedSessionIds` in `utils/` is asked by both `admin-user-controller.ts` (which displays them) and `SessionCleanupService` (which deletes them), so the two cannot drift into asking it in different words.
- **Rationale**: The services here run to a thousand lines and more, and what can be named on its own is what leaves without a fight. Once out, it is testable without the service's dependencies — and a second caller can have it.
