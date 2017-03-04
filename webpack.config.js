var webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function (env) {
    var production = env === 'production';
    return {
        context: path.resolve(__dirname, './src'),
        entry: './js/core',
        devtool: 'source-map',
        module: {
            loaders: [
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader", use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: production// {/* CSSNano Options */}
                                }
                            },
                            {
                                loader: 'sass-loader'
                            }
                        ]
                    })
                }
            ]
        },
        output: {
            path: './dist',
            filename: production ? 'js/autocomplete.min.js' : 'js/autocomplete.js'
        },
        plugins: production ? [
            new ExtractTextPlugin("css/autocomplete.min.css")

        ] : [
            new ExtractTextPlugin("css/autocomplete.css")
        ]
    }
};