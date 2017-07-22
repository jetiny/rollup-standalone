const fse = require('fs-extra')

let file = require.resolve('rollup-plugin-vue2/src/index.js')
fse.copy(file, './lib/rollup-plugin-vue2.js')
