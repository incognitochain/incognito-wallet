const commonPlugins = [
  '@babel/plugin-proposal-optional-catch-binding',
  ['transform-class-properties', { spec: true }],
  '@babel/plugin-proposal-optional-chaining',
  'transform-function-bind',
  '@babel/plugin-proposal-export-default-from',
  '@babel/plugin-proposal-export-namespace-from',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-proposal-throw-expressions',
  [
    'module-resolver',
    {
      alias: {
        '@src': './src',
        '@models': './src/models',
        '@services': './src/services',
        '@utils':'./src/utils',
        '@assets':'./src/assets',
        '@components': './src/components',
        '@screens': './src/screens',
        '@routers':'./src/router'
      }
    }
  ],
];

const commonPresets = [
  'module:metro-react-native-babel-preset',
  '@babel/preset-flow',
  'module:react-native-dotenv'
];

module.exports = function(api) {
  const isDev = api.env('development');
  const config = {
    presets: [...commonPresets],
    plugins: [...commonPlugins],
  };

  if (!isDev) {
    config.plugins = [
      ...config.plugins,
      // minify
      ['babel-plugin-transform-remove-console', { 'exclude': [ 'debug' ] }],
      'babel-plugin-transform-remove-debugger',
      'babel-plugin-transform-remove-undefined'
    ];
  }

  return config;
};
