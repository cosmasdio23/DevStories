const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        open: true,
        port: 9000, //Pakai 9000 atau 8080, remind dengan proyek dicoding lainnya /cosmas/cd:C
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        compress: true,
    },
});
