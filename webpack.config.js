// File: webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';

  // Define environment variables to inject
  const envVars = {
    'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
    'process.env.VITE_STORYBLOK_TOKEN': JSON.stringify(
      process.env.VITE_STORYBLOK_TOKEN || ''
    ),
    'process.env.VITE_STORYBLOK_VERSION': JSON.stringify(
      process.env.VITE_STORYBLOK_VERSION || 'draft'
    ),
    'process.env.VITE_STORYBLOK_SPACE_ID': JSON.stringify(
      process.env.VITE_STORYBLOK_SPACE_ID || ''
    ),
    'process.env.VITE_STORYBLOK_REGION': JSON.stringify(
      process.env.VITE_STORYBLOK_REGION || 'eu'
    ),
    'process.env.VITE_BASE_URL': JSON.stringify(
      process.env.VITE_BASE_URL || 'http://localhost:3000'
    ),
  };

  return {
    entry: './src/index.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin(envVars),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
        ],
      }),
    ],

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
      // Use new server option instead of deprecated https
      server: isDevelopment ? 'https' : 'http',
      // Allow connections from Storyblok
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
      // Custom setup for better HTTPS support
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        // Log the correct HTTPS URL
        devServer.compiler.hooks.done.tap('log-https', () => {
          if (isDevelopment) {
            console.log('\n🔒 HTTPS Development Server:');
            console.log('   Local:    https://localhost:3000');
            console.log('   Network:  https://your-ip:3000');
            console.log('\n🎯 Use this URL in Storyblok Visual Editor:');
            console.log('   https://localhost:3000/');
            console.log(
              '\n💡 If you get security warnings, click "Advanced" → "Proceed to localhost"'
            );
          }
        });

        return middlewares;
      },
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          svarog: {
            test: /[\\/]node_modules[\\/]svarog-ui[\\/]/,
            name: 'svarog-ui',
            chunks: 'all',
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
