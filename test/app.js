import Vue from 'vue'
import VueRouter from 'vue-router'
import {prop} from 'sav-util'

Vue.use(VueRouter)

let app = new Vue({
  el: '#app'
})

prop(window, 'app', app)
