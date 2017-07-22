import babel from 'rollup-plugin-babel-standalone'
import vue from './rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'
import include from 'rollup-plugin-includepaths'
import * as rollup from 'rollup'
import mixin from './util.js'

let ret = Object.assign({
  include,
  json,
  re,
  commonjs,
  resolve,
  vue,
  babel
}, rollup)

Object.assign(ret, mixin(ret))

export default ret
