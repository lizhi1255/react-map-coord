import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";
import externals from "rollup-plugin-node-externals";
import pkg from "./package.json";

// 入口
const entry = "./src/packages/index.ts";

// Babel配置
const babelOptions = {
  presets: ["@babel/preset-env"],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".less"],
  exclude: "**/node_modules/**",
};

// 通用插件
const commonPlugins = [
  peerDepsExternal(),
  resolve(),
  postcss({
    // extract: true,
    namedExports: true,
    minimize: true,
    extensions: [".less", ".css"],
  }),
  commonjs({ sourceMap: true }),
  typescript(),
  babel(babelOptions),
  json(),
  externals({ devDeps: false }),
];

export default () => {
  return [
    {
      input: entry,
      output: [
        {
          file: pkg.main,
          format: "cjs",
        },
        {
          file: pkg.module,
          format: "es",
        },
        {
          file: pkg.unpkg,
          name: "coordMap",
          format: "umd",
        },
      ],
      plugins: [...commonPlugins],
      external: ["react", "react-dom"],
    },
    {
      input: entry,
      output: { dir: "dist/types" },
      plugins: [...commonPlugins, dts()],
    },
  ];
};
