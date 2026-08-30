// eslint-disable-next-line @typescript-eslint/no-var-requires
const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: "nx affected --targets=test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
  // The nx preset writes html only. The json report is what nyc reads to build one
  // report over all four projects (scripts/merge-coverage.sh); without it there is
  // nothing to merge. Both are written only when a run is asked for coverage, so a
  // plain `nx test` is unaffected.
  coverageReporters: ['html', 'json'],
  // Jest's 5s default is measured against wall clock, so it fails on a loaded CI
  // runner for tests that take milliseconds locally (module compilation on the
  // first require, fake-timer advances over Angular's zone). The higher ceiling
  // only affects how long a genuinely hanging test takes to report.
  testTimeout: 30000
};
