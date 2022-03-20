const withAntdLess = require('./node_modules/next-plugin-antd-less');
const { firstIp } = require('./src/app/utils/ips.ts')

module.exports = withAntdLess({
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
    __API_HOST__: firstIp,
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
});