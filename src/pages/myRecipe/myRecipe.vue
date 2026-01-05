<template>
  <view class="my-recipe">
    <view class="page-title">
      <text>我的食谱</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="in-progress">
      <view class="title">进行中</view>

      <view class="recipe-list" v-if="successRecipeList.length">
        <view class="recipe-item" v-for="item of successRecipeList" :key="item.id">
          <view class="time-box">
            <text class="time">{{ item.begin_date.slice(0, 10) }}</text>
            <text class="line"></text>
            <text class="days">第{{ days(item) }}天</text>
            <text class="line"></text>
            <text class="time">{{ item.end_date.slice(0, 10) }}</text>
          </view>

          <view class="icon">
            <image mode="widthFix" :src="item.image" />
            <view class="content">{{ item.name }}</view>
          </view>
        </view>
      </view>

      <view class="empty" v-else>无进行中食谱记录</view>
    </view>

    <view class="in-progress">
      <view class="title">已结束</view>

      <view class="recipe-list" v-if="unSuccessRecipeList.length">
        <view class="recipe-item" v-for="item of unSuccessRecipeList" :key="item.id">
          <view class="time-box">
            <text class="time">{{ item.begin_date.slice(0, 10) }}</text>
            <text class="line"></text>
            <text class="days" :class="{ noSuccess: item.summary_state === 3 }">{{
              item.summary_state === 3 ? '计划未达成' : '计划达成'
            }}</text>
            <text class="line"></text>
            <text class="time">{{ item.end_date.slice(0, 10) }}</text>
          </view>

          <view class="icon">
            <image mode="widthFix" :src="item.image" />
            <view class="content">{{ item.name }}</view>
          </view>
        </view>
      </view>

      <view class="empty" v-else>无已结束食谱记录</view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'myRecipe',

  data() {
    return {
      recipeList: [],
    };
  },

  onLoad() {
    this.getRecipesList();
  },

  computed: {
    successRecipeList() {
      return this.recipeList.filter((x) => x.summary_state === 1);
    },

    unSuccessRecipeList() {
      return this.recipeList.filter((x) => x.summary_state !== 1);
    },

    days() {
      return (item) => {
        let days = (new Date() - new Date(item.begin_date.replace(/-/g, '/'))) / (24 * 60 * 60 * 1000);
        return Math.ceil(days);
      };
    },
  },

  methods: {
    getRecipesList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/recipes-summarys', {
          pageIndex: 1,
          pageSize: 999,
        })
        .then((res) => {
          uni.hideLoading();

          res.data.Items.forEach((item) => {
            item.image =
              item.image || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/shiji/file/shiji/202512/8e599f8638af45a.png';
          });

          this.recipeList = res.data.Items;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.my-recipe {
  padding: 0 0 80rpx;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 20rpx;
  }

  .in-progress {
    padding: 0 24rpx;
    margin-bottom: 40rpx;

    .title {
      font-size: 28rpx;
      color: #000000;
      margin-bottom: 40rpx;
    }

    .recipe-list {
      display: flex;
      flex-direction: column;
      gap: 40rpx;

      .recipe-item {
        background: #f3f3f3;
        border-radius: 20rpx;

        .time-box {
          padding: 20rpx 20rpx 0;
          display: flex;
          align-items: center;
          gap: 10rpx;
          margin-bottom: 32rpx;

          .time {
            font-size: 24rpx;
            color: #323131;
          }

          .days {
            height: 40rpx;
            background: #e8f480;
            border-radius: 60rpx;
            padding: 12rpx 22rpx;
            font-size: 28rpx;
            color: #323131;
            display: flex;
            align-items: center;
            justify-content: center;

            &.noSuccess {
              background: #dad2ff;
            }
          }

          .line {
            flex-grow: 1;
            border-bottom: 2rpx dashed #323131;
          }
        }

        .icon {
          position: relative;

          image {
            width: 100%;
            border-radius: 20rpx;
            display: block;
          }

          .content {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 48rpx;
            width: 100%;
            display: flex;
            align-items: center;
            padding-left: 18rpx;
            font-weight: 600;
            font-size: 20rpx;
            color: #ffffff;
            border-radius: 0 0 20rpx 20rpx;
            background: #32313180;
          }
        }
      }
    }

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      font-size: 32rpx;
      color: #00000080;
    }
  }
}
</style>
