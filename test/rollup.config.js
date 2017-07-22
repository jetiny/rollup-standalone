const {executeRollup} = require('../')
const path = require('path')

module.exports = executeRollup({
  cli: true,
  entry: path.resolve(__dirname, './app.js'),
  dest: path.resolve(__dirname, './bundle.js'),
  format: 'iife',
  vueOptions: true,
  uglifyOptions: true,
  patterns: [
    {
      test: 'process.env.NODE_ENV',
      replace: "'production'"
    }
  ]
})
