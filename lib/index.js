import babel from 'rollup-plugin-babel-standalone'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'
import * as rollup from 'rollup'

export default Object.assign({
  json, 
  re, 
  commonjs, 
  resolve,
  vue, 
  babel
}, rollup)
