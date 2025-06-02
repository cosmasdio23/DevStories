const { merge } = require('webpack-merge');
const common = require('./webpack.common'); // common Anda adalah fungsi
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  // argv.mode akan 'production' jika dipanggil oleh skrip build Anda
  // yang menyertakan --mode production.
  // Kita pastikan mode diteruskan ke common dengan benar.
  // Jika argv atau argv.mode tidak ada, kita default ke 'production' di sini
  // karena ini adalah file konfigurasi produksi.
  const effectiveMode = (argv && argv.mode) ? argv.mode : 'production';
  const effectiveArgv = { ...argv, mode: effectiveMode };
  const commonConfig = common(env, effectiveArgv); // Panggil common sebagai fungsi

  return merge(commonConfig, {
    // mode: 'production', // Ini sudah di-set oleh Webpack CLI atau skrip Anda
    // dan diteruskan ke commonConfig melalui effectiveArgv.
    // Jika Anda ingin lebih eksplisit, bisa ditambahkan di sini juga,
    // tapi seharusnya tidak perlu jika skrip build sudah benar.
    devtool: 'source-map', // Anda bisa ganti ke 'source-map' atau false/hidden-source-map untuk produksi
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
        // Jika rule Babel di common.js sudah mencakup kebutuhan produksi,
        // Anda tidak perlu mendefinisikannya lagi di sini kecuali ada perbedaan spesifik.
        // Dari konfigurasi Anda, rule Babel ini sama dengan yang ada di common.js.
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
    plugins: [
      // Plugin dari commonConfig (seperti HtmlWebpackPlugin, CopyWebpackPlugin)
      // akan otomatis ter-merge.
      // Tambahkan plugin spesifik produksi di sini:
      // MiniCssExtractPlugin akan ditambahkan di common.js secara kondisional jika Anda menggunakannya.

      new WorkboxWebpackPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        swDest: 'sw.js',
        importScripts: ['custom-sw-push-logic.js'], // Pastikan file ini ada di public/
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
};
