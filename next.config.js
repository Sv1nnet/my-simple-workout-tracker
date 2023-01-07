const withPlugins = require('next-compose-plugins');
const withAntdLess = require('./node_modules/next-plugin-antd-less');
const { firstIp } = require('./src/app/utils/ips.ts')
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  runtimeCaching: [
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 * 365 // 1 year
        }
      }
    },
  ]
})

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
          __API_HOST__: `http://${process.env.API_HOST || firstIp}:3005`,
          // __API_HOST__: `http://localhost:3005`,
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
    // [
    //   withPWA,
    // ],
  ],
);
