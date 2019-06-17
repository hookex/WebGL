const {resolve} = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CONFIG = {
    entry: {
        'app': './index.js',
        'webgl-worker': './webgl-worker.js'
    },
    plugins: [new HtmlWebpackPlugin({
        title: 'three.js',
        template: './index.html'
    })]
};

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('./webpack.config.local')(CONFIG)(env) : CONFIG);
