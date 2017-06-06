import {babel, vue, commonjs, resolve} from 'rollup-standalone'

export default {
  entry: './app.js',
  dest: 'bundle.js',
  format: 'iife',
  plugins: [
    vue(),
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: 'node_modules/**'
    }),
    resolve({
      main: true
    }),
    commonjs({})
  ]
}
