<template>
  <view class="recipes-detail">
    <view class="page-title">
      <text>{{ recipesDetail.name }}</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="cookbook-box">
      <view class="time-nav">
        <view
          class="time-item"
          :class="{ active: selectDateKey === key }"
          v-for="(item, key) of dateList"
          :key="key"
          @click="selectDateKey = key"
        >
          <!-- TODO 序号 -->
          <text>{{ 1 }}</text>
          <text class="date" :class="{ active: selectDateKey === key }">{{ key.slice(5, 10) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'recipesDetail',

  data() {
    return {
      id: undefined,
      recipesDetail: {},
      dateList: [],
      selectDateKey: undefined,
    };
  },

  onLoad(options) {
    this.id = options.id;
    this.getRecipesDetail();
  },

  methods: {
    getRecipesDetail() {
      uni.showLoading({
        title: '加载中...',
      });

      $http
        .get('api/diet-info/recipes-template-info', {
          id: this.id,
        })
        .then((res) => {
          uni.hideLoading();

          res.data.recipes_list = res.data.recipes_list || [];

          let dateList = {};

          res.data.recipes_list.forEach((item) => {
            let date = item.date;

            if (dateList[date]) {
              dateList[date].push(item);
            } else {
              dateList[date] = [item];
            }
          });

          Object.keys(dateList).forEach((dateListKey, index) => {
            let foodList = {};
            let item = dateList[dateListKey];

            item.forEach((item) => {
              let type = item.type;

              if (foodList[type]) {
                foodList[type].push(item);
              } else {
                foodList[type] = [item];
              }
            });

            if (index === 0) {
              this.selectDateKey = dateListKey;
            }

            dateList[dateListKey] = foodList;
          });

          console.log(JSON.parse(JSON.stringify(dateList)));

          this.dateList = dateList;
          this.recipesDetail = res.data;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.recipes-detail {
  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 24rpx;
  }

  .cookbook-box {
    padding: 0 36rpx;

    .time-nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 20rpx;

      .time-item {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 20rpx 20rpx 20rpx 20rpx;
        background: #fcffea;

        &.active {
          background: #e8f480;
        }

        text {
          &:nth-child(1) {
            font-size: 28rpx;
            color: #000000;
            margin-bottom: 4rpx;
          }

          &:nth-child(2) {
            font-size: 16rpx;
            color: #333333;
          }
        }
      }
    }
  }
}
</style>
