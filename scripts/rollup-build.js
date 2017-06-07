import rollup from '../lib/index.js'

let {executeRollup, fse, uglifyFile, errorExit} = rollup
let vpkg = require('vue-template-compiler/package.json')
let uglifyOptions = false

export default executeRollup({
  cli: true,
  entry: './lib/index.js',
  dest: 'dist/rollup-standalone.js', 
  format: 'cjs',
  external: [
    'babel-standalone-rollup',
    'acorn'
  ],
  uglifyOptions,
  patterns: [
    { //------------------------------------acorn
      match: /rollup\-plugin\-commonjs/,
      test: `require('acorn')`,
      replace: "'require_acorn'",
      restore: "require('./acorn')"
    },
    { //------------------------------------vue
      match: /vue\-template\-compiler/,
      test: `try {
  var vueVersion = require('vue').version
} catch (e) {}`,
      replace: `var vueVersion = 'require_vue_version'`,
      restore:`try {
  var vueVersion = require('vue').version
} catch (e) {}
`
    },
    { //------------------------------------vue
      match: /vue\-template\-compiler/,
      test: `var packageName = require('./package.json').name
var packageVersion = require('./package.json').version
`,
      replace: `
var packageName = "${vpkg.name}";
var packageVersion = "${vpkg.version}";
`
    },
    { //------------------------------------babel-standalone
      match: /rollup\-plugin\-babel\-standalone/,
      test: `require('babel-standalone-rollup')`,
      replace: "'require_babel-standalone-rollup'",
      restore: "require('./babel-standalone')"
    },
    { //------------------------------------resolve
      match: /rollup\-plugin\-node\-resolve/,
      test: `var COMMONJS_BROWSER_EMPTY = _nodeResolve.sync( 'browser-resolve/empty.js', __dirname );
var ES6_BROWSER_EMPTY = path.resolve( __dirname, '../src/empty.js' );`,
      replace: `var COMMONJS_BROWSER_EMPTY = path.resolve( __dirname, 'empty-browser.js' );
var ES6_BROWSER_EMPTY = path.resolve( __dirname, 'empty-es.js' );`
    },
  ]
}, () => {
  fse.ensureDir('dist').then(() => Promise.all([
    fse.copy(require.resolve('babel-standalone-rollup'), 'dist/babel-standalone.js')
      .then(() => uglifyOptions && uglifyFile('dist/babel-standalone.js', uglifyOptions)),
    fse.copy(require.resolve('acorn'), 'dist/acorn.js')
      .then(() => uglifyOptions && uglifyFile('dist/acorn.js', uglifyOptions)),
    fse.outputFile('dist/empty_browser.js', ''),
    fse.outputFile('dist/empty_es.js', 'export default {};'),
  ]).catch(errorExit('build-rollup-standalone')))
})

// rollup-cli
fse.copy(require.resolve('rollup/bin/rollup'), 'lib/rollup-cli.js').then(() => {
  return executeRollup({
    entry: './lib/rollup-cli.js',
    dest: 'dist/rollup-cli.js', 
    format: 'cjs',
    patterns: [
      {
        match: /rollup\-cli/,
        test: `#!/usr/bin/env node`,
        replace: ''
      },
    ],
    uglifyOptions
  }, (bundle, res) => {
    res.code = '#!/usr/bin/env node\n' + res.code
      .replace('source-map-support', './source-map-support')
      .replace('../dist/rollup.js', './rollup-standalone')
  })
}).catch(errorExit('build-rollup-cli'))

executeRollup({
  entry: require.resolve('source-map-support/source-map-support.js'),
  dest: 'dist/source-map-support.js', 
  format: 'cjs',
  uglifyOptions
}).catch(errorExit('build-source-map-support'))
