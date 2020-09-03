/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = [
  {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
      "vscode/index": "./src/vscode/index.ts",
    },
    output: {
      path: path.resolve("./dist"),
      filename: "[name].js",
      libraryTarget: "commonjs2",
    },
    target: "node",
    externals: [{ vscode: "commonjs vscode" }, nodeExternals({ modulesDir: "../../node_modules" })],
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      modules: [path.resolve("../../node_modules"), path.resolve("./node_modules"), path.resolve("./src")],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
        },
      ],
    },
  },
  {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
      "api/index": "./src/api/index.ts",
      "envelope/index": "./src/envelope/index.ts",
      "embedded/index": "./src/embedded/index.ts",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].js",
      libraryTarget: "commonjs2",
    },
    externals: [nodeExternals({ modulesDir: "../../node_modules" })],
    plugins: [],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            configFile: path.resolve("./tsconfig.json"),
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      modules: [path.resolve("../../node_modules"), path.resolve("./node_modules"), path.resolve("./src")],
    },
  },
];
