<template>
  <view class="dietary-record">
    <view class="page-title">
      <text>饮食记录</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="nav-tab">
      <calendar2 ref="calendar2" @selectDayChange="selectDayChange" />
    </view>

    <view class="food-types">
      <view class="food-type-item" v-for="item of foodRecodeList" :key="item.type">
        <view class="title">{{ item.text }}</view>

        <view class="food-list" v-if="item.foodList && item.foodList.length">
          <view class="food-item" v-for="item1 of item.foodList" :key="item1.id">
            <text>{{ item1.name }}{{ item1.weight }}克</text>
            <text>{{ item1.calorie }}千卡</text>
            <image v-if="item1.img_path" mode="aspectFill" :src="item1.img_path" />
            <text v-else></text>
          </view>
        </view>

        <view class="empty" v-else>当日无{{ item.text }}记录</view>
      </view>
    </view>
  </view>
</template>

<script>
import Calendar2 from '@/components/calendar2.vue';
import $http from '@/utils/http';

export default {
  name: 'dietaryRecord',

  components: {
    Calendar2,
  },

  data() {
    return {
      selectDate: {},
      foodRecodeList: [
        {
          type: 1,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type01.png?t=123',
          text: '早餐',
          foodList: [],
        },
        {
          type: 3,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type02.png?t=123',
          text: '午餐',
          foodList: [],
        },
        {
          type: 5,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type03.png?t=123',
          text: '晚餐',
          foodList: [],
        },
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png?t=123',
          text: '早加餐',
          foodList: [],
        },
        {
          type: 4,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png?t=123',
          text: '午加餐',
          foodList: [],
        },
        {
          type: 6,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png?t=123',
          text: '晚加餐',
          foodList: [],
        },
      ],
    };
  },

  watch: {
    async selectDate() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      await this.getDailyFoods().catch(() => {});

      uni.hideLoading();
    },
  },

  methods: {
    selectDayChange(value) {
      this.selectDate = {
        currentDate: new Date(value),
        numberDay: new Date(value).getDay(),
      };
    },

    getDailyFoods() {
      return $http
        .post('api/diet-info/daily-list', {
          date: this.selectDate.currentDate.format(),
        })
        .then((res) => {
          this.foodRecodeList.forEach((item) => {
            let current = res.data.find((item1) => item1.type === item.type);
            item.foodList = (current && current.die_list) || [];
          });
        });
    },
  },
};
</script>

<style>
page {
  background: #ffffff url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/dataReport/bg01.png') left top/100%
    auto no-repeat;
}
</style>

<style scoped lang="scss">
.dietary-record {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 42rpx;
  }

  .nav-tab {
    padding: 0 16rpx 34rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
  }

  .food-types {
    padding: 0 20rpx 80rpx;
    display: flex;
    flex-direction: column;
    gap: 60rpx;

    .food-type-item {
      .title {
        font-weight: 600;
        font-size: 28rpx;
        color: #323131;
        margin-bottom: 20rpx;
      }

      .food-list {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .food-item {
          height: 90rpx;
          background: #f3f3f3;
          border-radius: 20rpx;
          padding: 0 16rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          text {
            flex-shrink: 0;
            width: calc(50% - 40rpx);
            padding-right: 10rpx;
            font-size: 28rpx;
            color: #323131;
          }

          image {
            flex-shrink: 0;
            width: 80rpx;
            height: 60rpx;
            border-radius: 10rpx;
          }
        }
      }

      .empty {
        height: 90rpx;
        background: #f3f3f3;
        border-radius: 20rpx;
        font-size: 28rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
