import fse from 'fs-extra'
import uglifyes from 'uglify-es/tools/index.js'
const {minify} = uglifyes

function uglify (userOptions) {
  const options = Object.assign({ sourceMap: true }, userOptions)
  return {
    name: 'uglify',
    transformBundle(code) {
      const result = minify(code, options)
      if (result.error) {
        throw result.error
      }
      return result
    }
  }
}

export default ({re, json, resolve, commonjs, rollup, babel, vue}) => {

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
    delete entry.replaces
    delete entry.defines
    delete entry.babelOptions
    delete entry.uglifyOptions
    delete entry.vueOptions
    delete entry.resolveOptions
    delete entry.commonjsOptions
    delete entry.cli
    if (config.cli) {
      return entry
    }
    return rollup(entry).then(function (bundle) {
      return config.dest ? bundle.write({
        dest: config.dest,
        format: config.format || 'cjs',
        moduleName: config.moduleName
      }) : bundle
    })
  }

  function createPlugins ({patterns, defines, replaces, babelOptions, uglifyOptions, vueOptions, resolveOptions, commonjsOptions}, ongenerate) {
    let restore = patterns ? patterns.filter((it) => 'restore' in it) : []
    restore = restore.length ? restoreCode(restore) : false
    let ret = [
      re({
        defines,
        replaces,
        patterns: patterns || [],
      }),
      json({
        preferConst: false // Default: false
      })
    ]
    .concat(vueOptions ? [vue(Object.assign({}, vueOptions))] : [])
    .concat(babelOptions ? [
      babel(Object.assign({
        babelrc: false,
      }, babelOptions))] : [])
    .concat([
      resolve(Object.assign({
        jsnext: false,
        module: false,
        "jsnext:main": false,
        main: true
      }, resolveOptions)),
      commonjs(Object.assign({
        include: 'node_modules/**'
      }, commonjsOptions)),
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