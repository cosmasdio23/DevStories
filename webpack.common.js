const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => { // Ubah menjadi fungsi untuk mendapatkan argv.mode
  const isProduction = argv.mode === 'production';
  const repositoryName = 'DevStories'; //REPO https://github.com/cosmasdio23/DevStories

  return {
    entry: {
      app: path.resolve(__dirname, 'src/scripts/index.js'),
    },
    output: {
      // Gunakan [contenthash] untuk cache busting di produksi
      filename: isProduction ? '[name].[contenthash].bundle.js' : '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      // Atur publicPath untuk produksi agar sesuai dengan path GitHub Pages
      publicPath: isProduction ? `/${repositoryName}/` : '/',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/, // Rule untuk CSS Anda yang sudah ada
          use: [
            {
              loader: 'style-loader', // Tetap menggunakan style-loader
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.js$/, // Rule untuk JavaScript (Babel)
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource', // Menggunakan Asset Modules Webpack 5
          generator: {
            // Path output untuk gambar, relatif terhadap output.path (dist/)
            filename: 'assets/images/[name].[contenthash][ext][query]'
          }
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, 'public/index.html'),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/'),
            to: path.resolve(__dirname, 'dist/'),
            globOptions: {
              ignore: ['**/index.html'], // Sudah di-handle oleh HtmlWebpackPlugin
            },
          },
        ],
      }),
      // Tidak ada MiniCssExtractPlugin di sini karena Anda tetap menggunakan style-loader
    ],
  };
};
