const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const common = {
  mode: isDev ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  devtool: isDev ? 'source-map' : false,
};

const rendererConfig = {
  ...common,
  target: 'electron-renderer',
  entry: {
    renderer: './src/renderer/index.tsx',
  },
  resolve: {
    ...common.resolve,
    fallback: {
      "global": false,
      "process": false,
      "Buffer": false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

const mainConfig = {
  ...common,
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'get-foreground-window.ps1', to: 'get-foreground-window.ps1' }
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
    ],
  },
};

const preloadConfig = {
  ...common,
  target: 'electron-preload',
  entry: {
    preload: './src/main/preload.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
    ],
  },
};

module.exports = [rendererConfig, mainConfig, preloadConfig];