import babel from 'rollup-plugin-babel-standalone'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import re from 'rollup-plugin-re'
import fs from 'fs-extra'

export default {
  entry: './lib/rollup-cli.js',
  dest: 'dist/rollup-cli.js', 
  format: 'cjs',
  plugins: [
    re({
      patterns: [
        {
          match: /rollup\-cli/,
          test: `#!/usr/bin/env node`,
          replace: ''
        },
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
    }),
    {
      name: 'copy-files',
      ongenerate(bundle, res){
        res.code = '#!/usr/bin/env node\n' + res.code.replace('source-map-support', './source-map-support')
          .replace('../dist/rollup.js', './rollup-standalone')
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
