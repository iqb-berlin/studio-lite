// eslint-disable-next-line @typescript-eslint/no-var-requires
const { merge } = require('webpack-merge');

module.exports = (config, context) => merge(config, {
  optimization: {
    minimize: false
  }
});
