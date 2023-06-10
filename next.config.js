const withPlugins = require('next-compose-plugins');
const withAntdLess = require('./node_modules/next-plugin-antd-less');
const { firstIp } = require('./src/app/utils/ips.ts')

const isProd = process.env.NODE_ENV === 'production'
const apiHost = isProd
  ? process.env.PRODUCTION_API_HOST
  : `http://${process.env.API_HOST || firstIp}:3005`

module.exports = withPlugins(
  [
    [
      withAntdLess,
      {
        // optional
        modifyVars: {
          '@primary-color': '#0aa679'
        },
        // optional
        lessVarsFilePath: './src/styles/theme.less',
        // optional
        lessVarsFilePathAppendToEndOfContent: false,
        // optional https://github.com/webpack-contrib/css-loader#object
        cssLoaderOptions: {},
        // plugins: [new AntdDayjsWebpackPlugin()],
    
        // Other Config Here...
        publicRuntimeConfig: {
          __IS_PROD__: isProd,
          __API_HOST__: apiHost,
        },
    
        typescript: {
          ignoreBuildErrors: true,
        },
        eslint: {
          // Warning: This allows production builds to successfully complete even if
          // your project has ESLint errors.
          ignoreDuringBuilds: true,
        },
        webpack(config) {
          return config;
        },
      }
    ],
  ],
);
