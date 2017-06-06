import babel from 'rollup-plugin-babel-standalone'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import fs from 'fs-extra'
import re from 'rollup-plugin-re'

let vpkg = require('vue-template-compiler/package.json')

export default {
  entry: './lib/index.js',
  dest: 'dist/rollup-standalone.js', 
  format: 'cjs',
  moduleName: "rollup",
  external: [
    'babel-standalone-rollup',
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
        {
          match: /vue\-template\-compiler/,
          test: `try {
  var vueVersion = require('vue').version
} catch (e) {}`,
          replace: `var vueVersion = 'require_vue_version'`,
        },
        {
          match: /vue\-template\-compiler/,
          test: `var packageName = require('./package.json').name
var packageVersion = require('./package.json').version
`,
          replace: `
var packageName = "${vpkg.name}";
var packageVersion = "${vpkg.version}";
`
        },
        {
          match: /rollup\-plugin\-babel\-standalone/,
          test: `require('babel-standalone-rollup')`,
          replace: "'require_babel-standalone-rollup'"
        },
        {
          match: /rollup\-plugin\-node\-resolve/,
          test: `var COMMONJS_BROWSER_EMPTY = _nodeResolve.sync( 'browser-resolve/empty.js', __dirname );
var ES6_BROWSER_EMPTY = path.resolve( __dirname, '../src/empty.js' );`,
          replace: `var COMMONJS_BROWSER_EMPTY = path.resolve( __dirname, 'empty-browser.js' );
var ES6_BROWSER_EMPTY = path.resolve( __dirname, 'empty-es.js' );`
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
        res.code = res.code
          .replace("'require_acorn'", "require('./acorn')")
          .replace("'require_babel-standalone-rollup'", "require('./babel-standalone')")
          .replace("var vueVersion = 'require_vue_version'", `try {
  var vueVersion = require('vue').version
} catch (e) {}
`)
        fs.copy(require.resolve('babel-standalone-rollup'), 'dist/babel-standalone.js', err => {
          if (err) return console.error(err)
          console.log('copy babel-standalone')
        })
        fs.copy(require.resolve('acorn'), 'dist/acorn.js', err => {
          if (err) return console.error(err)
          console.log('copy acorn')
        })
        fs.writeFile('dist/empty_browser.js', '', err => {
          if (err) return console.error(err)
          console.log('create empty_browser')
        })
        fs.writeFile('dist/empty_es.js', 'export default {};', err => {
          if (err) return console.error(err)
          console.log('create empty_es')
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
