import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'
import {prop} from 'sav-util'

Vue.use(VueRouter)

let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})

prop(window, 'app', app)
