// globalSetup of the api and api-dto specs. They run in Jest's ESM mode, which needs Node's
// --experimental-vm-modules; the project's .env puts it into NODE_OPTIONS. Nx does not replace
// a NODE_OPTIONS that is already set, though, and without the flag every spec fails with a parse
// error that does not name it (#2031). Without the flag node:vm has no SourceTextModule.
// Adding the flag to NODE_OPTIONS is offered for api and api-dto alone: with it the frontend
// specs fail to run, so it would break any run that includes them.
const { SourceTextModule } = require('node:vm');

module.exports = () => {
  if (!SourceTextModule) {
    const current = process.env.NODE_OPTIONS;
    throw new Error(current
      ? `These specs need --experimental-vm-modules. NODE_OPTIONS was already set to "${current}", `
        + 'and Nx does not replace it with the one from the project\'s .env. Run them without it '
        + '(env -u NODE_OPTIONS npx nx ...), or add the flag for api and api-dto alone: '
        + 'NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx nx run-many -t test -p api,api-dto.'
      : 'These specs need --experimental-vm-modules, which Nx takes from the project\'s .env. '
        + 'Run them through Nx.');
  }
};
