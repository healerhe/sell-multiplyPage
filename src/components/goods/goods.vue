<template>
    <div class="goods">
      <div class="menu-wrapper" ref="menuWrapper" style="background:#f3f5f7">
        <ul>
          <li v-for="(item, index) in goods" v-bind:key="item.index" class="menu-item"
            :class="{'current':currentIndex === index}" @click = "selectMenu(index,$event)">
              <span class="text">
                <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
              </span>
          </li>
        </ul>
      </div>
      <div class="foods-wrapper" ref="foodsWrapper">
        <ul>
          <li v-for="item in goods" class="foodList foodListHook" v-bind:key="item.index">
            <h1 class="title">{{item.name}}</h1>
            <ul>
              <li v-for="food in item.foods" class="food-item" v-bind:key="food.index" >
                <div class="icon">
                  <img width="57" :src="food.icon"/>
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span>月售{{food.sellCount}}</span><span class="count">好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="new">￥{{food.price}}</span>
                    <span v-show="food.oldPrice" class="old">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartAdd-wrapper">
                    <cartAdd :food="food" @increment="incrementTotal" :db="db"></cartAdd>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <shopCart :select-products="selectProducts" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopCart"></shopCart>
    </div>
</template>

<style lang="stylus" rel="stylesheet">
  @import "goods.styl"
</style>

<script type="text/ecmascript-6">
  import BetterScroll from 'better-scroll';
  import shopCart from 'components/shopCart/shopCart';
  import cartAdd from 'components/cartAdd/cartAdd';
  const SUCCESS = 0;
  export default{
    data () {
      return {
         goods: [],
        classMap: [],
        listHeight: [],
        /* 用于跟踪屏幕高度变化的当前值 */
        scrollY: 0,
        db: {},
        foods: []
      };
    },
    computed: {
      /* 用于计算当前索引值，以为就是scrollY的高度对应的右边食物的第几组的索引 */
      currentIndex () {
        for (let i = 0; i < this.listHeight.length; i++) {
          let heightUp = this.listHeight[i]; // 当前menu子块的高度
          let heightDown = this.listHeight[i + 1]; // 下一个menu子块的高度
          // 滚动到底部的时候,height2为undefined,需要考虑这种情况
          // 需要确定是在两个menu子块的高度区间
          if (!heightDown || (this.scrollY >= heightUp && this.scrollY < heightDown)) {
              return i;
          }
        }
        return 0;
      },
      selectProducts() { // 自动将所有的goods.food添加一个count属性,方便做数量运算
        let foods = [];
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food);
            }
          });
        });
        return foods;
      }

    },
    props: {
      seller: {
        type: Object
      }
    },
    created() {
      this.createDB('sell');
      this.openDB('sell');
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
      this.$http.get('/api/goods').then((response) => {
        response = response.body;
        if (response.errno === SUCCESS) {
            this.goods = response.data;
          /* Vue中数据更新是异步的，
           在数据还没有加载完之前，
           BScroll是无法获取目标内容容器的高度的，
           就会出现无法滚动的现象。
            添加这个之后才能正确计算menuWrappe的高度 */
            this.$nextTick(() => {
              if (!this.scroll) {
                this.initBetterScroll();
              } else {
                this.scroll.refresh();
              }

              this.calculateHeight();
            });
        };
      });
    },
    methods: {
      incrementTotal(target) {
        /* 当点击“加号”按钮时，cartControl组件通过emit触发父组件goods中的increment方法，并将event.target对象传入，
        increment方法将target传入shopCart子组件中的drop方法，
        所以drop方法能获得用户点击按钮的元素，即能获取点击按钮的位置 */
        /* 体验优化，异步执行下落动画 */
        this.$nextTick(() => {
          this.$refs.shopCart.drop(target);
        });
      },
      initBetterScroll() {
        this.menuScroll = new BetterScroll(this.$refs.menuWrapper, {
          click: true
        });
        console.log(this.menuScroll);
        this.foodsScroll = new BetterScroll(this.$refs.foodsWrapper, {
          click: true,
          /* 希望foodsScroll在滚动时能实时告诉我们位置，探帧 */
          probeType: 3
        });
        /* 监听scroll滚动时的高度将其赋值给scrollY */
        this.foodsScroll.on('scroll', (pos) => {
          this.scrollY = Math.abs(Math.round(pos.y));
          // 滚动坐标会出现负的,并且是小数,所以需要处理一下，实时取得scrollY
        });
      },
      calculateHeight() {
        let foodList = this.$refs.foodsWrapper.getElementsByClassName('foodListHook');
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < foodList.length; i++) {
          let itemHeight = foodList[i];
          // 得到每个食物区间的高度
          height += itemHeight.clientHeight;// 主要是为了获取每一个foods内部块的高度
          this.listHeight.push(height);
        }
      },
      selectMenu(index, event) {
        if (!event._constructed) { // 去掉自带的click事件点击，即pc端直接返回
          return;
        }
        let foodsList = this.$refs.foodsWrapper.getElementsByClassName('foodListHook');
        let el = foodsList[index];
        // 类似jump to的功能,通过这个方法,跳转到指定的dom
        this.foodsScroll.scrollToElement(el, 300);
      },
      createDB(dbName) {
        // 创建数据库
        var request = window.indexedDB.open(dbName, 1);
        // 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件upgradeneeded。
        request.onupgradeneeded = function (event) {
          // 这时通过事件对象的target.result属性，拿到数据库实例。
          this.db = event.target.result;
          // 通常，新建数据库以后，第一件事是新建对象仓库（即新建表）。
          // 数据库新建成功以后，新增一张叫做person的表格，主键是id。
          // 主键（key）是默认建立索引的属性
          var objectStore;
          if (!this.db.objectStoreNames.contains('shopCart')) {
           /*  objectStore = db.createObjectStore('shopCart', { keyPath: 'id' }); */
            objectStore = this.db.createObjectStore('shopCart', {keyPath: 'id'});
            // 如果数据记录里面没有合适作为主键的属性，那么可以让 IndexedDB 自动生成主键。
            /* objectStore = db.createObjectStore('person', { autoIncrement: true }); */
            // 新建对象仓库以后，下一步可以新建索引。
            // DBObject.createIndex()的三个参数分别为索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）。
           /* objectStore.createIndex('name', 'name', { unique: false }); */
          }
        };
      },
      openDB(dbName) {
        var _this = this;
        // 打开数据库，若有就打开，若没有则创建
        var request = window.indexedDB.open(dbName, 1);
        request.onerror = function (event) {
          console.log('数据库打开报错');
        };
        request.onsuccess = function (event) {
          // 通过request对象的result属性拿到数据库对象
          _this.db = request.result;
          console.log(_this.db);
          _this.read_all();
          console.log('数据库打开成功');
        };
        // 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件upgradeneeded。
        request.onupgradeneeded = function (event) {
          // 这时通过事件对象的target.result属性，拿到数据库实例。
          _this.db = event.target.result;
        };
      },
      deleteDB(dbName) {
        // indexedDB.deleteDatabase()方法用于删除一个数据库，
        // 参数为数据库的名字。它会立刻返回一个IDBOpenDBRequest对象，
        // 然后对数据库执行异步删除。删除操作的结果会通过事件通知
        var DBDeleteRequest = window.indexedDB.deleteDatabase(dbName);

        DBDeleteRequest.onerror = function (event) {
          console.log('Error');
        };

        DBDeleteRequest.onsuccess = function (event) {
          console.log('success');
        };
      },
      add_data(food) {
        var requestadd = this.db.transaction(['shopCart'], 'readwrite')
          .objectStore('shopCart')
          .add({ id: food.id, name: food.name, food: food });

        requestadd.onsuccess = function (event) {
          console.log('数据写入成功');
        };

        requestadd.onerror = function (event) {
          console.log('数据写入失败');
        };
      },
      read_data(name) {
        var transaction = this.db.transaction(['shopCart']);
        var objectStore = transaction.objectStore('shopCart');
        // 参数是主键的值,根据传入主键的值查出数据
       /* var request = objectStore.get(1); */
        var index = objectStore.index('name');
        var request = index.get(name);

        request.onerror = function(event) {
          console.log('事务失败');
        };

        request.onsuccess = function(event) {
          if (request.result) {
            console.log('food: ' + request.result.food);
          } else {
            console.log('未获得数据记录');
          }
        };
      },
      read_all() {
        var _this = this;
        var objectStore = this.db.transaction(['shopCart']).objectStore('shopCart');
        // 新建指针对象的openCursor()方法是一个异步操作，所以要监听success事件。
        objectStore.openCursor().onsuccess = function (event) {
          var cursor = event.target.result;
          if (cursor) {
            console.log(cursor.value);
            var food = cursor.value.food;
            /* Vue.set(food, 'count', cursor.value.count);
            Vue.set(food, 'name', cursor.value.name);
            Vue.set(food, 'price', cursor.value.price); */
            _this.foods.push(food);
            cursor.continue();
          } else {
            console.log('没有更多数据了！');
          }
        };
      },
      update_data(id, food) {
        // put()方法自动更新了主键为1的记录。
        var request = this.db.transaction(['shopCart'], 'readwrite')
          .objectStore('shopCart')
          .put({id: food.id, name: food.name, food: food});

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
    },
    components: {
      shopCart,
      cartAdd
    }
  };
</script>
