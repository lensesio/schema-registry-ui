const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');


const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

console.log('Building for ' + ENV);

const config = {
    watch: !isProd,
    devtool: isProd ? "cheap-source-map" : "cheap-module-source-map",
    entry: {
        app: "./src/app.js"
    },
    output: {
        filename: "js/[name].[hash].bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: ""
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    plugins: ['transform-decorators-legacy',
                        'transform-runtime',
                        'transform-object-rest-spread',
                        'transform-class-properties'],
                    presets: [['es2015', { modules: false }], 'stage-1']
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },

            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "assets/css/[name].[contenthash].css"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: function (module) {
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "manifest"
        }),
        new HtmlWebpackPlugin({ template: "./src/index.html" }),
        new CopyWebpackPlugin([{
            from: __dirname + '/src/assets',
            to: path.resolve(__dirname, "dist/src/assets")
        }]),
        new CopyWebpackPlugin([{
            from: __dirname + '/env.js',
            to: path.resolve(__dirname, "dist/")
        }]),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        alias: {
        }
    },
    devServer: {
        host: "localhost",
        port: "8080",
        contentBase: path.resolve(__dirname, "dist"),
        //compress: true,
        historyApiFallback: true,
        hot: true,
        inline: true,
        https: false,
        noInfo: true
    }
};

if (isProd) {
    config.plugins.push(
        new CleanWebpackPlugin(['dist']),
        new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            screw_ie8: true,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            join_vars: true,
            if_return: true
        },
        output: {
            comments: false
        }
    }))
}

module.exports = config;