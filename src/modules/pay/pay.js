/**
 * Created by healer on 2018/9/3.
 */
import Vue from 'vue';
import pay from '../../components/pay/pay.vue';
/* 负责对前后端进行交互的组件 */
import VueResource from 'vue-resource';

Vue.config.productionTip = false;
// 注册VueResource
Vue.use(VueResource);
/* eslint-disable no-new */
new Vue({
  el: '#pay',
  render: h => h(pay)
});
