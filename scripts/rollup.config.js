import babel from 'rollup-plugin-babel-standalone'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import fs from 'fs-extra'
import re from 'rollup-plugin-re'

export default {
  entry: './lib/index.js',
  dest: 'dist/rollup-standalone.js', 
  format: 'cjs',
  external: [
    'rollup-plugin-babel-standalone',
    'acorn'
  ],
  plugins: [
    re({
      patterns: [
        {
          match: /rollup\-plugin\-commonjs/,
          test: `require('acorn')`,
          replace: "'require_acorn'"
        },
      ]
    }),
    json({
      preferConst: false // Default: false
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      // exclude: 'node_modules/**',
      'plugins': [
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    resolve({
      jsnext: false,
      module: false,
      "jsnext:main": false,
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    {
      name: 'copy-files',
      ongenerate(bundle, res){
        res.code = res.code.replace('rollup-plugin-babel-standalone', './babel-standalone')
          .replace("'require_acorn'", "require('./acorn')")
        fs.copy(require.resolve('babel-standalone-rollup'), 'dist/babel-standalone.js', err => {
          if (err) return console.error(err)
          console.log('copy babel-standalone')
        })
        fs.copy(require.resolve('acorn'), 'dist/acorn.js', err => {
          if (err) return console.error(err)
          console.log('copy acorn')
        })
      }
    }
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
      }
    }
  }
}
