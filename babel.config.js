module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      // Add any additional plugins here if needed
    ],
    env: {
      development: {
        compact: false,
      },
      production: {
        compact: true,
      },
    },
  };
};
