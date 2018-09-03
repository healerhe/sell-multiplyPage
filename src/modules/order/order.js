/**
 * Created by healer on 2018/9/3.
 */
import Vue from 'vue';
import order from '../../components/order/order.vue';
/* 负责对前后端进行交互的组件 */
import VueResource from 'vue-resource';

Vue.config.productionTip = false;
// 注册VueResource
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
  el: '#order',
  render: h => h(order)
});
