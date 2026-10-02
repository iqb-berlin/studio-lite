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

## Workflow: Pull Requests and Tickets

Branches, the pipeline and the board columns are described in the README under *How work flows through this repository*. Read it before creating a branch, opening a pull request or moving a card on the board. The rules below begin with the two steps before any of that, the plan and the review, then repeat the two points most easily got wrong and add what the README leaves open.

### Before the Work: A Plan
- **Rule**: Every ticket starts with a plan, agreed with the person you are working for before anything is changed — a small ticket as well, whose plan is then three lines. Work out the plan in Claude Code's plan mode (Shift+Tab), which edits nothing until the plan is approved.
- **Rule**: The plan states decisions, not a list of options:
  - **what is asked for**, checked against the architecture: the Verona editor authors a unit, the player plays it, the studio hosts both and stores what they hand back. A finding that belongs to a Verona module is not work for this repository.
  - **the cause, with evidence** — reproduced or measured, not assumed.
  - **whether the fix is reachable**: who calls the code, and whether something later overwrites what it does.
  - **the scope**, and what is left out and becomes an issue of its own.
  - **the tests**, including whether an end-to-end test of its own is possible — that decides the column after the merge (see *Board 18*).
  - **the places at risk**: a database changeset, e2e selectors (no compiler sees Cypress), what frontend and API share in `libs/`.
- **Rule**: The plan goes into the conversation, not into the ticket; the ticket gets the result. Approving the plan is what moves the card to *In progress*. A plan that ends in a question, or in not building it, moves no card.
  - **Rationale**: A misunderstanding caught in a plan costs one message; caught in review it costs a pull request and a pipeline run. A session does not know what earlier sessions decided or rejected — without a plan, the first time a person sees what it is about to do is the finished pull request.

### Before the Commit: A Review
- **Rule**: Finish the change and verify it (tests, lint, typecheck), but do not commit it yet. Run `/code-review` on it first; only then commit, push and open the pull request.
  - **Rationale**: A review before the pull request can still turn the change around — a regression, or a fix that compiles, passes every suite and does nothing. After the pull request every such round costs a pipeline run.
- **Rule**: `/code-review` without a target reviews the uncommitted diff (`git diff HEAD`). Once the change is committed that diff is empty and the review finds nothing; then name the scope explicitly (`/code-review origin/develop..HEAD`, or the pull request number).
- **Rule**: After the review, check `git status`. Review agents can leave files of their own in the working tree; they do not belong in the commit.

### Pull Requests
- **Rule**: Never write `Closes #…`, `Fixes #…` or `Resolves #…` in a commit message or pull request text. Reference the issue as `(#1629)`.
  - **Rationale**: GitHub closes the ticket on merge, and the board moves it to *Done* past *zu testen* and *Zu veröffentlichen*.
- **Rule**: Force-push only with `--force-with-lease`, never with `--force`.
  - **Rationale**: `--force` silently overwrites whatever someone else pushed to the branch in the meantime.
- **Rule**: A pull request stays within the goal of its issue. What turns up on the way and belongs elsewhere — in review as well — becomes an issue of its own, not a commit on the branch.
  - **Rationale**: Every extra topic lengthens the review, and every further round costs a pipeline run of about 25 minutes.

### Board 18
- **Rule**: A ticket goes on the board of its own repository, even when it comes out of work on another one: studio-lite on [board 18](https://github.com/orgs/iqb-berlin/projects/18), verona-modules-aspect on [board 13](https://github.com/orgs/iqb-berlin/projects/13).
- **Rule**: `gh issue create` alone leaves a studio-lite ticket invisible — add it to board 18 as well (`gh project item-add 18 --owner iqb-berlin --url <issue-url>`). A new card goes to *Neue Tickets*; *Priority* and *Aufwand* stay empty, the team estimates them.
- **Rule**: Move a card to *In progress* once the plan is approved, and only while working towards a pull request. The column tells colleagues that something is being built; looking into a ticket, or an analysis that ends in a question, is not that yet.
- **Rule**: After the merge the test decides the column. With an end-to-end test of its own the change goes to *Zu veröffentlichen*, without one to *zu testen*, where someone else builds the test.
  - "Of its own" means a test that checks exactly this change and would fail without it. An existing spec that keeps passing does not count.
  - **Exception**: Upgrades, CI and dependency changes without behaviour of their own (Angular, NestJS, ESLint, the release gate) go to *Zu veröffentlichen*; the whole suite is their test.
- **Rule**: *In review* means released and awaiting validation by the reporters, not code-reviewed. A ticket stays open through all of these columns; do not close it by hand.

### Tickets
- **Rule**: In a ticket written by someone else, leave their text as it is and keep exactly **one** comment headed "Stand", edited whenever something new is known. In a ticket of your own the description is the current state: edit it rather than append to it.
  - **Rationale**: A ticket is read for where things stand, not as a log of how anyone got there.
- **Rule**: Keep comments short: the result, its consequence, one reference (a file, a commit, a pull request). Approaches that were dropped stay out of the ticket.
- **Rule**: A question goes to the person you are working for, not into the ticket.
  - **Rationale**: A question in a ticket makes work for everyone who reads it and is outdated the next day.
