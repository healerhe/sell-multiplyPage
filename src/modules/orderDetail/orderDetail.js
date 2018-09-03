/**
 * Created by healer on 2018/9/3.
 */
import Vue from 'vue';
import orderDetail from '../../components/orderDetail/orderDetail.vue';
/* 负责对前后端进行交互的组件 */
import VueResource from 'vue-resource';

Vue.config.productionTip = false;
// 注册VueResource
Vue.use(VueResource);
/* eslint-disable no-new */
new Vue({
  el: '#orderDetail',
  render: h => h(orderDetail)
});
