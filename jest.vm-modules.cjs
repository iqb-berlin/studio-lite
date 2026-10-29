// globalSetup of the api and api-dto specs. They run in Jest's ESM mode, which needs Node's
// --experimental-vm-modules; the project's .env puts it into NODE_OPTIONS. Nx does not replace
// a NODE_OPTIONS that is already set, though, and without the flag every spec fails with a parse
// error that does not name it (#2031). Without the flag node:vm has no SourceTextModule.
const { SourceTextModule } = require('node:vm');

module.exports = () => {
  if (!SourceTextModule) {
    const current = process.env.NODE_OPTIONS;
    throw new Error(current
      ? `These specs need --experimental-vm-modules. NODE_OPTIONS was already set to "${current}", `
        + 'and Nx does not replace it with the one from the project\'s .env. Run them with '
        + 'NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx nx test <project>.'
      : 'These specs need --experimental-vm-modules, which Nx takes from the project\'s .env. '
        + 'Run them through Nx, or with NODE_OPTIONS=--experimental-vm-modules.');
  }
};
