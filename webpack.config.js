import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDirectoryProd = path.join(__dirname, 'cdn');
const outputDirectoryDev = path.join(__dirname, 'site', 'export', 'brillnt', 'js');
const outputDirectoryShopify = path.join(__dirname, 'site', 'shopify', 'assets');
const cdnUrl = "https://--CHANGEME--.brillnt.com";

const getOutputDirectory = (env) => {
  if (env.development) return outputDirectoryDev;
  if (env.shopify) return outputDirectoryShopify;

  return outputDirectoryProd;
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

export default (env) => ({
  // each property is an output file (ex. home.bundle.js)
  entry: {
    home: './project/src/pages/index.js'
  },
  output: {
    filename: `${env.shopify ? 'br_' : ''}[name].bundle.min.js`,
    path: getOutputDirectory(env),
    clean: env.shopify ? false : true,
  },
  mode: 'production',
  optimization: {
    minimize: env.production ? true : false,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_debugger: env.development ? false : true,
        },
        format: {
          comments: false,
        },
      },
      extractComments: false,
    })],
    // Split common code into separate chunk
    splitChunks: {
      chunks: 'all',
      name: 'common'
    }
  },
  plugins: [
    ...(env.production ? [
      new CdnUrlLoggerPlugin({
        cdnBase: cdnUrl
      })
    ] : [])
  ],
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
      }
    ]
  }
});
