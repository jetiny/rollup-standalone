const fss = require('fs-extra')

fss.readFile(require.resolve('rollup/bin/rollup'), (err, data) => {
  let dist = 'lib/rollup-cli.js'
  if (err) {
    throw err
  }
  data = data.toString()
  fss.writeFile(dist, data, (err) => {
    if (err) {
      throw err
    }
    console.log('Done')
  })
})
