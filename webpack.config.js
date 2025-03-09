import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directories
const outputDirectoryProd = path.join(__dirname, 'cdn');
const outputDirectoryDev = path.join(__dirname, 'site', 'export', 'brillnt');
const outputDirectoryShopify = path.join(__dirname, 'site', 'shopify', 'assets');
const cdnUrl = "https://fuller.brillnt.com";

const getOutputDirectory = (env, moduleName) => {
  if (moduleName) return path.join(__dirname, 'site', 'export', moduleName);
  if (env.development) return outputDirectoryDev;
  if (env.shopify) return outputDirectoryShopify;

  return outputDirectoryProd;
};

// Get the appropriate subdirectory for files
const getFilePath = (env, fileType) => {
  if (env.shopify) return ''; // No subdirectories for Shopify
  return `${fileType}/`; // Adds 'js/' or 'css/' subdirectory
};

// Custom plugin to log the CDN URL
class CdnUrlLoggerPlugin {
  constructor(options) {
    this.cdnBase = options.cdnBase || cdnUrl;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('CdnUrlLoggerPlugin', (compilation) => {
      const assets = compilation.getAssets();
      console.log('\n--- CDN URLs for Production ---\n');
      assets.forEach(asset => {
        console.log(`-- ${this.cdnBase}/${asset.name}`);
      });
      console.log('\n-----------------------------\n');
    });
  }
}

export default (env) => {
  const moduleName = env.module;
  const entry = moduleName
    ? { [moduleName]: `./project/src/modules/${moduleName}/${moduleName}.js` }
    : {
        base: './project/src/pages/base.js',
        home: './project/src/pages/home.js',
        product: './project/src/pages/product.js',
        systems: './project/src/pages/systems.js',
        modules: './project/src/pages/modules.js',
      };

  const plugins = [
    new MiniCssExtractPlugin({
      filename: `${getFilePath(env, 'css')}${env.shopify ? 'br_' : ''}[name].min.css`
    }),
    ...(env.production ? [
      new CdnUrlLoggerPlugin({
        cdnBase: cdnUrl
      })
    ] : [])
  ];

  if (moduleName) {
    plugins.push(
      new HtmlWebpackPlugin({
        template: `./project/src/modules/${moduleName}/${moduleName}.html`,
        filename: 'index.html',
        inject: 'body',
      })
    );
  }

  return {
    entry,
    output: {
      filename: `${getFilePath(env, 'js')}${env.shopify ? 'br_' : ''}[name].bundle.min.js`,
      path: getOutputDirectory(env, moduleName),
      clean: env.shopify ? false : true,
    },
    mode: 'production',
    performance: {
      hints: 'warning',
      maxEntrypointSize: 1024000,
      maxAssetSize: 1024000,
    },
    optimization: {
      minimize: env.production && !moduleName,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_debugger: env.development ? false : true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        name: 'common'
      }
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    }
  };
};