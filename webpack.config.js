const path = require("path");
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const ENTRY = {
  // Packs (but does not seem to save space)
  editors: "./src/all-editors.js",
  'api-pack': "./src/api-pack.js",
  // Separate plugins
  editorjs: "./src/editorjs/editorjs-plugin.ts",
  tinyeditor: "./src/tinyeditor/tinyeditor-plugin.ts",
  tiptap: "./src/tiptap/tiptap-plugin.ts",
  quill: "./src/quill/quill-plugin.ts",
  asyncapi: "./src/asyncapi/asyncapi-plugin.tsx",
  swagger: "./src/swagger/swagger-plugin.ts",
  jsonschema: "./src/json-schema/json-schema-plugin.tsx",
  bpmn: "./src/bpmn/bpmn-plugin.ts",
  markdown: "./src/markdown/markdown-plugin.tsx",
};

module.exports = {
  entry: ENTRY,
  // devtool: "inline-source-map",   // prevents production mode
  output: {
    filename: "[name]-plugin.webpack.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      { test: /\.svg$/, loader: "svg-inline-loader" },
      { test: /\.yaml$/, use: "raw-loader" },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
          test: /\.scss$/i,
          use: ["style-loader", "css-loader","sass-loader"],
        },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        use: {
          loader: 'url-loader',
        },
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        },
      },      
    ],
  },
  externals: {
    mxgraph: "window",
  },
  resolve: {
    alias: {
      quill$: path.resolve(__dirname, "node_modules/quill/quill.js"),
    },
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      assert: require.resolve('assert'),
      path: require.resolve("path-browserify"),
      http: require.resolve("http-browserify"),
      https: require.resolve("https-browserify"),
      fs: require.resolve("browserify-fs"),
      util: require.resolve('util'),
      console: require.resolve('console-browserify'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new NodePolyfillPlugin(),
  ],
  //target: "electron-renderer",
};
