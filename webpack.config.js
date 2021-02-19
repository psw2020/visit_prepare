module.exports = {
  renderer: {
    entry: './src/renderer/javascripts/index.js',
  },
  preload: {
    entry: './src/preload/index.js',
  },
  main: {
    entry: './src/main/index.js',
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          },
        },
      ],
    },
  },
};
