const fse = require('fs-extra')
const path = require('path')

const nodeFile = require.resolve('uglify-es')
const nodeDir = path.dirname(nodeFile)

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

let replaceText = `var fs = require("fs");

var UglifyJS = exports;
var FILES = UglifyJS.FILES = [
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/transform.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js",
    "../lib/propmangle.js",
    "../lib/minify.js",
    "./exports.js",
].map(function(file){
    return require.resolve(file);
});

new Function("MOZ_SourceMap", "exports", function() {
    var code = FILES.map(function(file) {
        return fs.readFileSync(file, "utf8");
    });
    code.push("exports.describe_ast = " + describe_ast.toString());
    return code.join("\\n\\n");
}())(
    require("source-map"),
    UglifyJS
);
`

let files = [
  "../lib/utils.js",
  "../lib/ast.js",
  "../lib/parse.js",
  "../lib/transform.js",
  "../lib/scope.js",
  "../lib/output.js",
  "../lib/compress.js",
  "../lib/sourcemap.js",
  "../lib/mozilla-ast.js",
  "../lib/propmangle.js",
  "../lib/minify.js",
  "./exports.js",
]

function concatFiles (appendText) {
  return Promise.all(files.map((it) => {
    return inputTextFile(path.resolve(nodeDir, it))
  })).then((arr) => {
    let text = arr.join('\n')
    return `var UglifyJS = exports;
var MOZ_SourceMap = require('source-map');

${text}

UglifyJS.describe_ast = describe_ast;

${appendText}
`
  })
}

inputTextFile(nodeFile).then((text) => {
  if (text.indexOf(replaceText) === 0) {
    return concatFiles(text.replace(replaceText, '')).then((data) => {
      return fse.outputFile(path.resolve(nodeDir, 'index.js'), data)
    })
  }
  throw new Error('invalid uglify-es version')
})
