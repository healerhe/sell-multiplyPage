// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from '../../components/App';
/* 负责对前后端进行交互的组件 */
import VueResource from 'vue-resource';
import router from '../../router/index';

Vue.config.productionTip = false;
// 注册VueResource
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
