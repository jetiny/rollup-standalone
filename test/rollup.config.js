import {executeRollup} from 'rollup-standalone'

export default executeRollup({
  cli: true,
  entry: './app.js',
  dest: 'bundle.js',
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
