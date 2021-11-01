const path = require("path");
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const ENTRY = {
  editors: "./src/all-editors.js",
  swagger: "./src/swagger/swagger-plugin.ts",
  asyncapi: "./src/asyncapi/asyncapi-plugin.tsx",
  markdown: "./src/markdown/markdown-plugin.tsx",
  editorjs: "./src/editorjs/editorjs-plugin.ts",
  tinyeditor: "./src/tinyeditor/tinyeditor-plugin.ts",
  tiptap: "./src/tiptap/tiptap-plugin.ts",
  quill: "./src/quill/quill-plugin.ts",
};

module.exports = {
  entry: ENTRY,
  devtool: "inline-source-map",
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
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
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
      path: require.resolve("path-browserify"),
      http: require.resolve("http-browserify"),
      https: require.resolve("https-browserify"),
      fs: require.resolve("browserify-fs"),
    },
  },
  plugins: [new NodePolyfillPlugin()],
  //target: "electron-renderer",
};
