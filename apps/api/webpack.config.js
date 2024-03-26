// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  // Default Nx composable plugin
  withNx(),
  // Custom composable plugin
  config => config
  // `config` is the Webpack configuration object
  // `options` is the options passed to the `@nx/webpack:webpack` executor
  // `context` is the context passed to the `@nx/webpack:webpack` executor
  // customize configuration here
);
