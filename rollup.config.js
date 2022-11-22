import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";
import externals from "rollup-plugin-node-externals";
import { terser } from "rollup-plugin-terser"; //代码压缩
import pkg from "./package.json";

// 入口
const entry = "./src/packages/index.ts";

// Babel配置
const babelOptions = {
  presets: ["@babel/preset-env"],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".less"],
  exclude: "**/node_modules/**",
  plugins: [
    //处理样式按需加载
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: "css",
      },
    ],
  ],
};

// 通用插件
const commonPlugins = [
  peerDepsExternal(),
  resolve(),
  typescript(),
  postcss({
    // extract: true, //css文件单独提前
    namedExports: true,
    minimize: true,
    extensions: [".less", ".css"],
  }), //处理less 需在babel之前
  commonjs({ sourceMap: true }),
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
      plugins: [...commonPlugins, terser()],
      external: ["react", "react-dom"],
    },
    {
      input: entry,
      output: { dir: "dist/types" },
      plugins: [...commonPlugins, dts()],
      external: (id) => /.less/.test(id), //忽略less文件
    },
  ];
};
