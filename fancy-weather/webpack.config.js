const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
    const isProduction = options.mode === 'production';

    const config = {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'none' : 'source-map',
        watch: !isProduction,
        entry: ['./src/js/script.js', './src/sass/style.scss'],
        output: {
            path: path.join(__dirname, '/dist'),
            filename: 'main.js',
        },
        devServer: {
            overlay: true,

        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                      }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                      'style-loader',
                      MiniCssExtractPlugin.loader,
                      {
                        loader: 'css-loader',
                        options: {
                          sourceMap: true
                        }
                      }, 
                    ]
                  },
                  {
                    test: /\.scss$/,
                    use: [
                      'style-loader',
                      MiniCssExtractPlugin.loader,
                      {
                        loader: 'css-loader',
                        options: {
                          sourceMap: true
                        }
                      },  
                      {
                        loader: 'sass-loader',
                        options: {
                          sourceMap: true
                        }
                      }
                    ]
                  },
                  {
                    test: /\.(png|svg|jpe?g|gif)$/,
                    use: [
                        {
                            loader: 'file-loader',
                        }
                    ]
                },
                 {
                    test: /\.html$/,
                    loader: 'html-loader',
                },
                
            ]
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html',
                favicon: './src/assets/favicon.png',
            }),
            new MiniCssExtractPlugin({
                filename: 'style.css'
            }),
          //   new CopyPlugin([
          //     { from: './src/', to: './' },
          // ]),
        ]
    }

    return config;
}