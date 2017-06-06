import babel from 'rollup-plugin-babel-standalone'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import re from 'rollup-plugin-re'
import fs from 'fs-extra'

export default {
  entry: 'node_modules/source-map-support/source-map-support.js',
  dest: 'dist/source-map-support.js', 
  format: 'cjs',
  plugins: [
    re({
      patterns: [
      ]
    }),
    json({
      preferConst: false // Default: false
    }),
    babel({
      babelrc: false,
      // externalHelpers: false,
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
    })
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
      }
    }
  }
}
