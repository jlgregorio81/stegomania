import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default route(function () {
  return createRouter({
    history: createWebHashHistory(),
    routes
  })
})
