![GitHub Release (latest SemVer)](https://img.shields.io/github/v/release/iqb-berlin/studio-lite)
[![pipeline status](https://scm.cms.hu-berlin.de/iqb/studio-lite/badges/main/pipeline.svg)](https://scm.cms.hu-berlin.de/iqb/studio-lite/-/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Studio Lite

**API documentation: [iqb-berlin.github.io/studio-lite](https://iqb-berlin.github.io/studio-lite/)**

Authoring system for units and single pages to be used in a
[Verona](https://verona-interfaces.github.io)-compatible test system. Units are written in a
Verona editor module, played in a Verona player module, and Studio Lite is where they are
organised, reviewed, given metadata and coding schemes, and exported.

The repository is an Nx workspace: an Angular frontend and a NestJS API against a PostgreSQL
database, plus three libraries — `api-dto` and `shared-code` on both sides, `iqb-components` in the
frontend. A release ships the applications as Docker images, which is also how a server runs them —
see [Installation on a server](#installation-on-a-server).

## Documentation

| Where | What |
| --- | --- |
| [iqb-berlin.github.io/studio-lite](https://iqb-berlin.github.io/studio-lite/) | API documentation of both applications and the libraries, rebuilt from `develop` on every merge |
| [`rules.md`](rules.md) | Binding conventions for this repository. Read before the first change |
| [iqb-berlin.github.io/tba-info](https://iqb-berlin.github.io/tba-info/) | User documentation (not part of this repository) |

The published documentation covers both applications and the libraries in one document: Angular
components, services and pipes as well as the NestJS controllers, guards and the entities with
their columns and relations. Locally, `npm run docs` writes the same site to `dist/docs`.

### Unit test coverage

Measured is **only what the unit tests (Jest) reach** — the e2e suite is not part of it. One page
per test project and one over all of them, down to the single line of every file. It is published
alongside the API documentation.

| Page | Coverage by the unit tests of |
| --- | --- |
| [`coverage/all/`](https://iqb-berlin.github.io/studio-lite/coverage/all/) | **all four projects at once** |
| [`coverage/by-project/api/`](https://iqb-berlin.github.io/studio-lite/coverage/by-project/api/) | `apps/api` |
| [`coverage/by-project/frontend/`](https://iqb-berlin.github.io/studio-lite/coverage/by-project/frontend/) | `apps/frontend` |
| [`coverage/by-project/iqb-components/`](https://iqb-berlin.github.io/studio-lite/coverage/by-project/iqb-components/) | `libs/iqb-components` |
| [`coverage/by-project/shared-code/`](https://iqb-berlin.github.io/studio-lite/coverage/by-project/shared-code/) | `libs/shared-code` |

**What the numbers mean.** Every project measures its own sources only — even where its specs run
code of a library. The merged page is therefore the number for the workspace as a whole and the
only place where the four parts are weighted against each other by their size; it says nothing the
single pages do not. Whoever wants to decide whether something still needs a test reads the single
page.

Only TypeScript files are counted. `jest-preset-angular` instruments component templates as well;
their lines say whether a component was ever rendered, not whether anything about it was checked,
and they stay out for that reason.

Why the e2e suite is missing: it needs a database and a running server, so it is not collected in
the same run. What the pages show says nothing about whether a flow is checked in the browser —
only about what the unit tests execute.

After a red test run the page carries **no** coverage at all until the next green one — publishing
replaces the whole site every time, so the previous report is not kept. The documentation itself is
published either way.

Locally, `npm run test-app-coverage` writes every report to `coverage/` and merges them. The run is
deliberately throttled (`--parallel=1 --maxWorkers=2`), because otherwise the test projects take the
cores from each other and specs that take milliseconds locally run into the Jest timeout.

## Requirements

- **Node.js 24**, the major that `node:lts-bookworm` resolves to — the image the pipeline builds on
  and the version the documentation workflow pins. There is no `.nvmrc` and no `engines` field, so
  nothing enforces it locally.
- **npm**, **Docker**, **Docker Compose** and **Make**. Every `dev-*` target reads `.env.dev` — the
  `studio-lite-*` targets of a server installation read `.env.studio-lite` — so none of them works
  before that file exists.

```bash
cp .env.dev.template .env.dev
npm install
```

`.env.dev` carries the ports and the database credentials of the development environment; the
template's defaults work as they are.

## Get started

Two ways to run the application. Both need `.env.dev` and the installed dependencies.

**Everything in Docker** — closest to what a server runs:

```bash
make dev-build   # base image, then database, Liquibase, backend, frontend
make dev-up
```

**Only the database in Docker, frontend and backend from npm** — the shorter feedback loop, and the
one to pick while working on the code:

```bash
make dev-db-build
make dev-db-up
npm run start-frontend
npm run start-backend
```

`npm run start-app` serves both at once.

**Everything is reached through [http://localhost:4200](http://localhost:4200)**, the API included:
the Angular dev server proxies `/api` to the backend (`apps/frontend/proxy.conf.json`). Both ways
run that same dev server — the container only has the proxy target rewritten from `127.0.0.1:3333`
to `backend:3333` while its image is built (`apps/frontend/Dockerfile`, stage `dev`). The Nginx of
`config/frontend/` is in the production image and in no development run.

`api` is the API's global prefix, and the Swagger UI sits on it:
[http://localhost:4200/api](http://localhost:4200/api). It is built only when
`environment.production` is false, so a server has no UI there — and it routes differently as well:
Traefik sends everything under `/api` straight to the backend, past the frontend.

The backend also listens on `http://localhost:3333`, and `make dev-up` publishes that port, but
nothing needs it: it is the way past the proxy, useful when you want to know which of the two
answered. Both ports come from `HTTP_PORT` and `API_PORT` in `.env.dev`.

**On a fresh database no account exists.** The application asks for one on the first call, and that
account carries the administrator rights — from there on,
[First steps](#first-steps) applies to a development instance as well.

To stop, and to throw the data away:

```bash
make dev-down            # stops and removes the containers, keeps the volumes
make dev-volumes-clean   # deletes the data as well
```

### End-to-end tests

The e2e container drives the frontend inside the Docker network `app-net`, so it runs **only
together with `make dev-up`** — not against the npm servers. Start a fresh instance with an empty
database before a run: the specs create users, groups and workspaces and expect to be the only ones
doing so.

```bash
make dev-test-build-e2e   # after an nx workspace update
make dev-test-e2e
```

`make dev-test-e2e-api` and `make dev-test-e2e-ui-chrome` run one half each; `-firefox`, `-edge` and
the `-mobile` variants are the same suite in another browser or viewport.

### Where to reach when you want to change something

- `apps/frontend` — the Angular application: feature modules under `src/app/modules`, everything
  they share beside it
- `apps/api` — the NestJS API: controllers, guards, services and the TypeORM entities
- `libs/api-dto` — the DTOs both sides speak; a change here is a change to the contract
- `database/changelog` — the Liquibase changelog; the schema is migrated from here, not by TypeORM

And before the first commit: [`rules.md`](rules.md). It is binding here and answers most of what a
first change runs into — i18n, subscription handling, component layout, `any`, and the testing
policy.

## Commands

### npm

| Command | What it does |
| --- | --- |
| `npm run start-app` | Serves frontend and backend together |
| `npm run start-frontend` | Serves the Angular application on http://localhost:4200, `/api` proxied to the backend |
| `npm run start-backend` | Serves the NestJS API; reachable through the proxy and directly on http://localhost:3333 |
| `npm run build-app` | Builds both applications; `build-frontend` and `build-backend` build one |
| `npm run docs` | Builds the Compodoc documentation into `dist/docs`. Open `dist/docs/index.html` to read the state of your working tree; the published state of `develop` is at the link at the top |

### Test

| Command | What it does |
| --- | --- |
| `npm run test-app` | All unit tests of all four projects |
| `npm run test-frontend`, `npm run test-backend` | The unit tests of one application |
| `npm run test-app-coverage` | The same, throttled, with the coverage report and its merge |
| `npm run lint-app` | ESLint over all projects; `lint-frontend` also fixes what it can |
| `npm run test-e2e` | The Cypress suite headless against a production build |
| `npm run test-e2e-live` | Opens the Cypress UI and watches |
| `npm run test-e2e-api`, `npm run test-e2e-ui` | One half of the suite |
| `npm run test-e2e-ui-mobile` | The UI half in a 375 × 667 viewport |
| `npm run test-e2e-coverage` | The suite against the instrumented build. Nothing publishes that report: `scripts/merge-coverage.sh` merges an e2e report in when one lies at `coverage/by-project/e2e/`, and no run puts it there yet (#1624) |

The npm e2e scripts bring the frontend up themselves — Nx serves it as their dev server target —
but not the rest: the API and the database have to be running, and the database has to be empty.
The `make dev-test-e2e*` targets are the containerised variant of the same suite.

### Docker, via make

| Target | What it does |
| --- | --- |
| `make dev-build`, `make dev-up`, `make dev-down` | Build, start and remove the whole development stack |
| `make dev-start`, `make dev-stop`, `make dev-status`, `make dev-logs` | Work on the running containers; `SERVICE=db make dev-logs` narrows it to one |
| `make dev-db-build`, `make dev-db-up` | Build and start database and Liquibase alone, for the npm path |
| `make dev-db-down` | `docker compose down` — despite the name it takes the whole stack down, not only the database |
| `make dev-volumes-clean`, `make dev-images-clean`, `make dev-clean-all` | Throw away volumes, images, or both. The data is in the volumes |
| `make dev-test-app` | Runs the unit tests inside the running containers |

### Database

The schema belongs to Liquibase, not to TypeORM: `synchronize` is off, and a change to an entity
without a changeset in `database/changelog` does not reach the database. `make dev-db-up` starts the
Liquibase container alongside the database, so pending changesets are applied when the stack comes
up; the targets below run the same commands by hand.

| Target | What it does |
| --- | --- |
| `make dev-db-update-status` | How many changesets are not deployed yet |
| `make dev-db-update` | Applies them |
| `make dev-db-update-display-sql` | Prints the SQL an update would run, without running it |
| `make dev-db-validate-changelog` | Finds errors in the changelog before an update hits them |
| `make dev-db-update-testing-rollback` | Updates, rolls back, updates again — the check that a changeset is reversible |
| `make dev-db-rollback-lastchangeset` | Rolls the last changeset back |
| `make dev-db-update-history` | Lists what was deployed when |
| `make dev-db-generate-docs` | Generates the changelog documentation into `database/changelogDocs` |

`scripts/make/` holds these files and a few more — `audit.mk`, `scan.mk`, `push.mk`,
`prod-test.mk`. Every target in them carries a comment above it, and the root `Makefile` forwards to
all of them but one (`prod-test-e2e-electron`, which has to be called through its `mk` file).

## Repository layout

```
apps/api             NestJS API: controllers, guards, services, TypeORM entities
apps/frontend        Angular application: modules, components, services, pipes
apps/frontend-e2e    Cypress specs (src/e2e/api, src/e2e/ui) and their support code
libs/api-dto         the DTOs frontend and API share
libs/shared-code     logic both sides use
libs/iqb-components  reusable Angular components
database             Postgres and Liquibase images, changelog, generated changelog docs
config/frontend      Nginx configuration of the production frontend, mounted into the container
scripts              install.sh, update.sh, make targets, migration helpers
.gitlab-ci           the pipeline: branch and pre-release jobs, release jobs
```

## How work flows through this repository

```
issue → branch → pull request → green pipeline → review → merge into develop → release to main
```

### Branches

This repository follows the
[Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model.

```
develop      all active development; the default branch and what pull requests target
main         the state of the most recent release; the release tags sit here
feature/…    branched off develop, merged back into develop after review
fix/…        the same for a fix; chore/… and docs/… are in use as well
hotfix/…     branched off main for a fix that cannot wait for a release,
             merged into main and into develop
release/…    the version bump on the way from develop to main
```

A branch name carries the issue it belongs to: `fix/1629-group-admin-guard`.

### From issue to merge

1. **Branch off `develop`**, named as above.
2. **Reference the issue in the commit subject**, e.g. `(#1629)`. Do **not** write `Closes #1629`
   in the pull request: it closes the ticket on merge and skips the board column the team works
   from. Referencing is fine, keywords are not.
3. **Open a pull request against `develop`.**
4. **The pipeline runs on GitLab**, mirrored from GitHub — that is what the badge at the top points
   at. The only workflow in `.github/workflows` builds the documentation; besides it GitHub runs
   CodeQL and Dependabot from their default setups, and nothing of that gates a merge. A push to a
   branch runs `build-app`, `test-app`, `lint-app`, `typecheck-app` and `audit-app`; the database
   jobs come in when `database/` changed, and on a pull request they run either way. **The e2e
   suite runs only on a pull request against `develop`**, and there only the API specs and Chrome
   automatically — Firefox, Edge and the mobile viewports are manual jobs on the pipeline page.
5. **Read the jobs, not only the badge.** `test-app`, `lint-app`, `audit-app` and every e2e job are
   `allow_failure: true`: a red unit test leaves the pipeline green with a warning. What actually
   gates a merge is the build jobs, `test-db` and `typecheck-app` — the last one deliberately,
   because Cypress transpiles the e2e sources without type checking and a renamed member surfaces
   nowhere else (#1586, #1590).
6. **Rebase when `develop` moves**, then force-push with `--force-with-lease`. A pipeline result
   belongs to a commit, not to a pull request.
7. **Merge as a merge commit** once the pipeline is green.

Tickets live on [project board 18](https://github.com/orgs/iqb-berlin/projects/18). A card moves to
*In progress* when work starts and to *zu testen* once the fix is merged into `develop`; a change
that ships with its own end-to-end test goes to *Zu veröffentlichen* instead. *In review* means
released and awaiting validation, not code-reviewed — a ticket stays open until then and is closed
in *Done*.

### Releases

A release is `develop` merged into `main` and tagged there. The version number is bumped on a
`release/X.Y.Z` branch off `develop` and stands in five places: `package.json`,
`apps/frontend/src/main.ts` (`APP_VERSION`), `apps/frontend-e2e/cypress.config.ts` (`env.version`),
`apps/api/src/app/guards/app-version.guard.ts` and its spec. That branch goes to `main` as a pull
request; the tag is created by publishing the GitHub release. The tag job does not build anything —
it pulls the four images the `main` pipeline built for that commit and pushes them to Docker Hub as
`:X.Y.Z` and `:latest`, which is why that pipeline has to be green for exactly that SHA first.
Afterwards the same branch is merged into `develop`, so the bump is not missing there.

## Installation on a server

Studio Lite runs on a server as a set of Docker containers. Installation, update and operation are
driven by make targets that wrap the Docker commands; the Docker commands can be called by hand as
well. You need an account on the server that is allowed to run Docker.

### Installing

Download `install.sh` in the version you want — it is an asset of every
[release](https://github.com/iqb-berlin/studio-lite/releases), and it also sits in `scripts/` — and
run it:

```bash
bash install.sh
```

The script asks what it needs and does the rest. Early on it checks whether the IQB infrastructure
is already installed on the server. **Installing it is the recommended path**: it brings the edge
router [Traefik](https://traefik.io/), which takes every request and forwards it to the right
place, and the monitoring services [Prometheus](https://prometheus.io/) and
[Grafana](https://grafana.com/). Studio Lite is preconfigured for it, and the install and update
scripts carry out every configuration step it needs.

Studio Lite runs without that infrastructure too, but then routing and port exposure have to be
configured by hand — in the Docker Compose files and in the Nginx configuration
`config/frontend/default.conf.template` of the installation directory.

**HTTPS.** The IQB infrastructure redirects incoming HTTP requests to HTTPS. If you have a
certificate and a key, put both into `secrets/traefik` in the infrastructure's installation
directory and rename them to `certificate.pem` and `privkey.pem`. Without one, the install and
update scripts can generate a self-signed certificate, and Traefik replaces an invalid one with a
fresh self-signed certificate on its own. A self-signed certificate is a stopgap: browsers will
answer it with a **security warning**.

### Running the application

The installation directory gets `scripts/make/studio-lite.mk` — this repository's `prod.mk` under
another name — and a `Makefile` that includes it; the `traefik-` targets come from the
infrastructure's own Makefile, which is why they exist only where it is installed. Everything about
the application is prefixed `studio-lite-`. Start the infrastructure first, if it is not up already:

```bash
make traefik-up
make studio-lite-up
```

When those commands are through, the edge router and the monitoring are running, the database is
set up, and API and website answer — the server is reachable from a browser right away.

| Target | What it does |
| --- | --- |
| `make studio-lite-up` | Starts the application; also the way an update is applied |
| `make studio-lite-down` | Stops it and removes its containers |
| `make studio-lite-logs` | The current log output |
| `make studio-lite-status`, `make studio-lite-config` | What is running, and with which configuration |
| `make studio-lite-update` | Runs the update script (see below) |
| `make studio-lite-dump-all`, `make studio-lite-restore-all` | Backup and restore of the database cluster (`pg_dumpall`). Both stop the application first |
| `make studio-lite-export-backend-vol`, `make studio-lite-import-backend-vol` | The other half of a backup: the uploaded Verona modules in the backend volume |
| `make studio-lite-liquibase-status`, `make studio-lite-connect-db` | Pending schema changes, and a psql session |

The infrastructure containers usually do not need to be stopped; other applications can use them as
well. Every further target is explained in the `mk` files the `Makefile` includes.

### First steps

After the installation no user account exists. The web application asks you to create one on the
first call — note the credentials down, that account carries special rights. Then set up the
following:

1. **Users.** Everyone who is to develop units with the system needs an account.
2. **Workspace groups** and the access rights to them.
3. **Verona modules** — at least one editor and one player module.
4. **Texts:** start page and imprint/privacy. If your server is publicly reachable, you are legally
   obliged to.

Then go back to the start page (click the logo at the top left) and open the admin function of a
workspace group (the gear icon next to the group name):

5. Add a workspace.
6. Give existing users access to it.

From the start page, a workspace can now be opened and units defined in it.

### Configuring and updating

The installation is steered by `.env.studio-lite`: the server name and the TLS certificate resolver
(both have to match the `.env.traefik` of the infrastructure), the database credentials and the
volume the data lives in — and `TAG`, which decides **which version is installed**. A fresh
installation carries `latest`, the most recent stable version. Any other version can be entered by
hand, which is also how a pre-release is pinned; the
[list of all releases](https://github.com/iqb-berlin/studio-lite/releases) says what there is.

**Make a backup before every update** — a snapshot of the server, for instance. And restore one at
least once before you need to: a backup you have never restored is a hope, not a plan.

An update is `make studio-lite-up` again: the target pulls the images `TAG` names and then recreates
every container whose image changed. That takes about a minute. The data is not part of the
containers — it lives in volumes on the server — so only the program is exchanged and work can
continue immediately. `make studio-lite-update` is the other half — it asks whether to update the
application or the infrastructure, and the second is where an expired self-signed certificate is
renewed and the infrastructure's login data changed. The application path offers a backup of its own
before it touches anything: a dump of the database and an export of the backend volume, into
`backup/<date>` of the installation directory. Take it.

**Schema changes are applied automatically**, but forward only. Going back to a version older than
the installed one can leave the database in a state the old code cannot work with, and the old
schema may not be reconstructible.

## Browsers

What is actually tested is what the e2e suite runs against: **Chrome, Firefox and Edge**, each of
them at 1600 × 900 and at 375 × 667. Chrome at 1600 × 900 runs on every pull request against
`develop`, the other five combinations are manual jobs on the pipeline page. Safari is in no run.

For the CSS, no `browserslist` of this repository reaches the build: Angular prefixes for its own
defaults, and that is the better state to be in. Those defaults move with every Angular release,
while a list of ours would only ever be as current as the last time someone remembered it (#1639).
