const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin'); // Impor Workbox plugin

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [ // Tambahkan atau gabungkan dengan array plugins yang ada di common jika ada
    // ... plugin lain yang mungkin sudah Anda definisikan di common atau ingin ditambahkan di sini ...

    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      swDest: 'sw.js', // sw.js akan dibuat di root folder output (misalnya 'dist/sw.js')
      importScripts: ['custom-sw-push-logic.js'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'dicoding-story-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Strategi untuk gambar dari API dan aset gambar lokal Anda
          urlPattern: ({ request, url }) => request.destination === 'image' || url.pathname.startsWith('/assets/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-and-assets-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
            },
          },
        },
        // Cache untuk Application Shell (index.html) dan manifest.json
        {
          urlPattern: ({ request }) => request.mode === 'navigate' ||
            request.destination === 'document' ||
            request.destination === 'manifest',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'app-shell-cache',
            networkTimeoutSeconds: 3,
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        }
      ],
    }),
  ],
});
