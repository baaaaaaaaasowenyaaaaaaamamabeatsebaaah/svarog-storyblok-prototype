// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CompressionPlugin from 'compression-webpack-plugin';
import webpack from 'webpack';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';
  const isAnalyze = process.env.ANALYZE === 'true';

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

  const config = {
    entry: './src/index.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
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
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: ['last 2 versions', 'not dead', '>0.2%'],
                    },
                    modules: false,
                    useBuiltIns: 'usage',
                    corejs: 3,
                  },
                ],
              ],
              plugins: isProduction
                ? [
                    [
                      'transform-remove-console',
                      {
                        exclude: ['error', 'warn'],
                      },
                    ],
                  ]
                : [],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin(envVars),

      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
        // Preload critical resources
        ...(isProduction && {
          meta: {
            description: 'Svarog-UI + Storyblok - Build amazing websites',
            viewport: 'width=device-width, initial-scale=1',
          },
        }),
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

      // Production-only plugins
      ...(isProduction
        ? [
            // Generate a manifest file
            new webpack.ids.HashedModuleIdsPlugin(),

            // Gzip compression
            new CompressionPlugin({
              filename: '[path][base].gz',
              algorithm: 'gzip',
              test: /\.(js|css|html|svg)$/,
              threshold: 10240,
              minRatio: 0.8,
            }),

            // Brotli compression
            new CompressionPlugin({
              filename: '[path][base].br',
              algorithm: 'brotliCompress',
              test: /\.(js|css|html|svg)$/,
              threshold: 10240,
              minRatio: 0.8,
            }),
          ]
        : []),

      // Bundle analyzer
      ...(isAnalyze
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: '../bundle-report.html',
              openAnalyzer: true,
            }),
          ]
        : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],

      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },

          // Svarog-UI chunk
          svarog: {
            test: /[\\/]node_modules[\\/]svarog-ui/,
            name: 'svarog-ui',
            priority: 20,
            reuseExistingChunk: true,
          },

          // Storyblok chunk
          storyblok: {
            test: /[\\/]node_modules[\\/]storyblok/,
            name: 'storyblok',
            priority: 20,
            reuseExistingChunk: true,
          },

          // Common chunk for shared code
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },

      runtimeChunk: 'single',

      moduleIds: isProduction ? 'deterministic' : 'named',
    },

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
      server: isDevelopment ? 'https' : 'http',
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.json'],
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map',

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
    },

    stats: {
      children: false,
      modules: false,
    },
  };

  return config;
};
