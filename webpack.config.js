var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "app.js"
    },
    module: {
        loaders: [
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: {
                "presets": ["es2015"]
              }
            }
        ]
    },
    devtool: "#inline-source-map"
};
