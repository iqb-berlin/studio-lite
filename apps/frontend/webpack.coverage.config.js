const path = require('path');

module.exports = {
  module: {
    parser: {
      json: {
        namedExports: true
      }
    },
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: '@jsdevtools/coverage-istanbul-loader',
        options: { esModules: true },
        enforce: 'post',
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, '../../libs')
        ],
        exclude: [
          /\.(e2e|spec)\.ts$/,
          /node_modules/,
          /(ngfactory|ngstyle)\.js/
        ]
      }
    ]
  }
};
