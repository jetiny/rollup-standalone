import fse from 'fs-extra'
// import uglifyes from 'uglify-js'
const {minify} = () => {}

function uglify (userOptions, minifier) {
  if (minifier === undefined) {
      minifier = minify
  }
  const options = Object.assign({ sourceMap: true }, userOptions)
  return {
    name: 'uglify',
    transformBundle(code) {
      const result = minifier(code, options)
      if (result.error) {
        throw result.error
      }
      return result
    }
  }
}

export default ({re, json, resolve, commonjs, rollup, babel}) => {

  function restoreCode (args) {
    return (bundle, res) => {
      args.forEach((item) => {
        if (typeof item.restore === 'function') {
          res.code = item.restore(res.code)
        }
        while (res.code.indexOf(item.replace) > 0) {
          res.code = res.code.replace(item.replace, item.restore)
        }
      })
    }
  }

  function executeRollup (config, ongenerate) {
    let entry = Object.assign({
      onwarn,
      plugins: createPlugins(config, ongenerate)
    }, config)
    delete entry.patterns
    delete entry.babelOptions
    delete entry.uglifyOptions
    delete entry.cli
    if (config.cli) {
      return entry
    }
    return rollup(entry).then(function (bundle) {
      return config.dest ? bundle.write({
        dest: config.dest,
        format: config.format || 'cjs',
      }) : bundle
    })
  }

  function createPlugins ({patterns, babelOptions, uglifyOptions}, ongenerate) {
    let restore = patterns ? patterns.filter((it) => 'restore' in it) : []
    restore = restore.length ? restoreCode(restore) : false
    let ret = [
      re({
        patterns: patterns || []
      }),
      json({
        preferConst: false // Default: false
      })
    ]
    .concat(babelOptions ? [
      babel(Object.assign({
        babelrc: false,
      }, babelOptions))] : [])
    .concat([
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
        name: 'generate-bundle',
        ongenerate(bundle, res){
          if (restore) {
            restore(bundle, res)
          }
          if (ongenerate) {
            return ongenerate(bundle, res)
          }
        }
      }
    ])
    .concat(uglifyOptions ? [
      uglify(uglifyOptions)
    ] : [])
    return ret
  }
  return {
    executeRollup,
    restoreCode,
    createPlugins,
    fse,
    uglify,
    minify,
    uglifyFile,
    inputFile,
    inputTextFile,
    errorExit
  }
}

function onwarn (err) {
  if (err) {
    if (err.code !== 'UNRESOLVED_IMPORT') {
      console.log(err.code, err.message)
    }
  }
}

function inputFile (file) {
  return new Promise((resolve, reject) => {
    fse.readFile(file, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

function inputTextFile (file) {
  return inputFile(file).then((buf) => buf.toString())
}

function uglifyFile (file, opts) {
  return inputTextFile(file).then((code) => {
    const result = minify(code, opts)
    if (result.error) {
      throw result.error
    }
    return fse.outputFile(file, result.code)
  })
}

function errorExit (message) {
  return (err) => {
    console.error('!ERROR!')
    if (message) {
      console.error(message)
    }
    console.error(err)
    process.exit(1)
  }
}