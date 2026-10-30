#!/usr/bin/env node
/**
 * Regenerates the committed runtime dependency pair of the api image (#1587):
 *
 *   apps/api/runtime-package.json
 *   apps/api/runtime-package-lock.json
 *
 * The api image used to `npm install` against the package.json nx generates
 * into dist/apps/api — a context that carries no lockfile, so every image
 * build resolved the tree against the registry anew. ioredis 6.0.0 (published
 * 2026-07-31, reachable only through transitive optional peers) broke every
 * develop image build for days without a single line in this repo changing.
 *
 * With the committed pair, the image runs `npm ci`: nothing is resolved at
 * build time, the tree is byte-for-byte the one this script pinned. The
 * Dockerfile still verifies at build time that the generated package.json has
 * not drifted from the committed pair, so forgetting to run this script fails
 * the image build with instructions instead of silently shipping stale deps.
 *
 * Run after changing backend dependencies or the root's overrides:
 *
 *   node scripts/update-api-runtime-deps.mjs
 *
 * (builds the api first, so dist/apps/api/package.json is current).
 *
 * With --check it writes nothing and fails if the run would change the
 * dependencies or overrides of runtime-package.json. Every branch pipeline
 * runs it, so that a drift no longer shows only in the image build after the
 * merge, and a changed override not at all (#1878).
 *
 * EXTRA_DEPENDENCIES lists runtime requirements nx cannot see because no
 * static import names them: typeorm loads its database driver dynamically.
 * Versions come from the root package-lock.json, so the driver is pinned to
 * exactly what the monorepo tests against.
 */
import { execSync } from 'node:child_process';
import {
  copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EXTRA_DEPENDENCIES = ['pg'];
const CHECK = process.argv.includes('--check');

const repoRoot = join(import.meta.dirname, '..');
const generatedPath = join(repoRoot, 'dist/apps/api/package.json');
const runtimePath = join(repoRoot, 'apps/api/runtime-package.json');
const runtimeLockPath = join(repoRoot, 'apps/api/runtime-package-lock.json');

console.log('Building api so dist/apps/api/package.json is current ...');
execSync('npx nx run api:build', { cwd: repoRoot, stdio: 'inherit' });

const generated = JSON.parse(readFileSync(generatedPath, 'utf8'));
const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const rootLock = JSON.parse(readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'));

const extraDependencies = Object.fromEntries(EXTRA_DEPENDENCIES.map(name => {
  const locked = rootLock.packages[`node_modules/${name}`];
  if (!locked) throw new Error(`${name} is not in the root package-lock.json`);
  return [name, locked.version];
}));

const runtimePackage = {
  name: generated.name,
  version: generated.version,
  description: 'Pinned runtime dependencies of the api image. Generated file, '
    + 'do not edit: run `node scripts/update-api-runtime-deps.mjs` (#1587).',
  dependencies: Object.fromEntries(Object.entries({
    ...generated.dependencies,
    ...extraDependencies
  }).sort(([a], [b]) => a.localeCompare(b))),
  // The root's overrides, so the image gets the same security floors as the
  // tree the monorepo tests against. @nestjs/platform-express, for one, pins
  // multer exactly, so only an override gets the image a fixed version.
  //
  // The ioredis override among them settles the one known optional-peer
  // conflict: @nestjs/microservices (an optional peer of @nestjs/core)
  // accepts any ioredis, typeorm pins ^5.0.4, and ioredis 6.0.0 satisfies
  // only the former. The override makes both ranges agree so npm's DEFAULT
  // resolution goes through -- which is essential, because the default is
  // what installs REQUIRED peers such as axios (for @nestjs/axios).
  // --legacy-peer-deps looked like the obvious fix and skipped those too: the
  // image built green and crashed on its first require (#1587, #1592).
  // ioredis itself still ends up NOT installed -- optional peers never are;
  // the override only exists for the resolver's consistency check.
  overrides: rootPackage.overrides
};

if (CHECK) {
  // name, version and description are left out: the version only moves with a release
  const committed = JSON.parse(readFileSync(runtimePath, 'utf8'));
  const drift = ['dependencies', 'overrides'].flatMap(field => {
    const expected = runtimePackage[field] || {};
    const actual = committed[field] || {};
    return [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
      .filter(name => JSON.stringify(expected[name]) !== JSON.stringify(actual[name]))
      .map(name => `  ${field} ${name}: expected ${JSON.stringify(expected[name])}, `
        + `committed ${JSON.stringify(actual[name])}`);
  });
  if (drift.length) {
    console.error(`${runtimePath} has drifted:`);
    drift.forEach(line => console.error(line));
    console.error('Run: node scripts/update-api-runtime-deps.mjs');
    process.exit(1);
  }
  console.log(`${runtimePath} is current.`);
  process.exit(0);
}

writeFileSync(runtimePath, `${JSON.stringify(runtimePackage, null, 2)}\n`);

// npm resolves the lockfile in an empty temp directory so that neither the
// monorepo's node_modules nor its lockfile leak into the runtime tree.
// Deliberately NO --legacy-peer-deps: required peers (axios) must be part of
// the tree, and the optional-peer conflict is settled by the override above.
const workDir = mkdtempSync(join(tmpdir(), 'api-runtime-lock-'));
try {
  copyFileSync(runtimePath, join(workDir, 'package.json'));
  console.log('Resolving the runtime lockfile against the registry (this is the ONE place that still does) ...');
  execSync('npm install --package-lock-only --ignore-scripts --no-fund --no-audit', {
    cwd: workDir, stdio: 'inherit'
  });
  copyFileSync(join(workDir, 'package-lock.json'), runtimeLockPath);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`Wrote ${runtimePath}`);
console.log(`Wrote ${runtimeLockPath}`);
