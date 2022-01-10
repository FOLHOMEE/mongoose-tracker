import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import filesize from 'rollup-plugin-filesize'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'

import packageJson from './package.json'

export default [{
  input: './src/index.ts',
  output: [{
    file: packageJson.main,
    format: 'cjs',
    sourcemap: true
  }, {
    file: packageJson.module,
    format: 'esm',
    sourcemap: true
  }],
  plugins: [
    json(),
    peerDepsExternal(),
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.test.*']
    }),
    terser(),
    filesize()
  ]
}, {
  input: 'build/types/index.d.ts',
  output: [{
    file: packageJson.types,
    format: 'esm'
  }],
  plugins: [dts()]
}]