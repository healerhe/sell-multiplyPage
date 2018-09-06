<template>
    <div class="cartAdd">
      <transition name="move">
      <div class="decrease" v-show="food.count>0"  @click="decrease">
        <span class="inner icon-remove_circle_outline"></span>
      </div>
      </transition>
      <div class="count" v-show="food.count>0">{{food.count}}</div>
      <div class="add" @click="add">
        <span class="icon-add_circle"></span>
      </div>
    </div>
</template>

<style lang="stylus" rel="stylesheet">
  @import "cartAdd.styl";
</style>

<script>
  import Vue from 'vue';
  export default{
    data () {
      return {
      };
    },
    props: {
      food: {
        type: Object
      },
      db: {}
    },
    methods: {
      add() {
        var _this = this;
        if (!event._constructed) { // 去掉自带的click事件点击，即pc端直接返回
          return;
        }
          if (!this.food.count) {
            Vue.set(this.food, 'count', 1);
            setTimeout(function() {
              _this.add_data(_this.food);
            }, 500);
          } else {
            this.food.count++;
            setTimeout(function() {
              _this.update_data(_this.food);
            }, 500);
          }
        this.$emit('increment', event.target);
      },
      decrease() {
        if (!event._constructed) { // 去掉自带的click事件点击，即pc端直接返回
          return;
        }
        this.food.count--;
      },
      add_data(food) {
        var request = this.db.transaction(['shopCart'], 'readwrite')
          .objectStore('shopCart')
          .add({ id: food.name, food: food });

        request.onsuccess = function (event) {
          console.log('数据写入成功');
        };

        request.onerror = function (event) {
          console.log('数据写入失败');
        };
      },
      read_data(food) {
        var transaction = this.db.transaction(['shopCart']);
        var objectStore = transaction.objectStore('shopCart');
        // 参数是主键的值,根据传入主键的值查出数据
         var request = objectStore.get(food.id);
      /*  var index = objectStore.index('name');
        var request = index.get(food.name); */
        var datatmp = [];
        request.onerror = function(event) {
          console.log('事务失败');
        };

        request.onsuccess = function(event) {
          if (request.result) {
            datatmp.push(request.result);
            console.log(datatmp);
          } else {
            console.log('未获得数据记录');
          }
        };
      },
      update_data(food) {
        // put()方法自动更新了主键为1的记录。
        var request = this.db.transaction(['shopCart'], 'readwrite')
          .objectStore('shopCart')
          .put({id: food.name, food: food});

        request.onsuccess = function (event) {
          console.log('数据更新成功');
        };

        request.onerror = function (event) {
          console.log('数据更新失败');
        };
      },
      delete_data(name) {
        var request = this.db.transaction(['person'], 'readwrite')
          .objectStore('person')
          .delete(name);
        request.onsuccess = function (event) {
          console.log('数据删除成功');
        };
      }
    }
  };
</script>
