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
        <!-- TODO 点击查看食谱详情 -->
        <view class="recipe-item" v-for="item of successRecipeList" :key="item.id">
          <view class="time-box">
            <text class="time">{{ item.startTime }}</text>
            <text class="line"></text>
            <text class="days">第{{ days(item) }}天</text>
            <text class="line"></text>
            <text class="time">{{ item.endTime }}</text>
          </view>

          <view class="icon">
            <image mode="widthFix" :src="item.img" />
            <view class="content">减脂入门7日食谱-1000Kcal轻量档</view>
          </view>
        </view>
      </view>

      <view class="empty" v-else>无进行中食谱记录</view>
    </view>

    <view class="in-progress">
      <view class="title">已结束</view>

      <view class="recipe-list" v-if="unSuccessRecipeList.length">
        <!-- TODO 点击查看食谱详情 -->
        <view class="recipe-item" v-for="item of unSuccessRecipeList" :key="item.id">
          <view class="time-box">
            <text class="time">{{ item.startTime }}</text>
            <text class="line"></text>
            <!-- TODO 食谱状态：达成、未达成 -->
            <text class="days" :class="{ noSuccess: !item.success }">{{
              item.success ? '计划达成' : '计划未达成'
            }}</text>
            <text class="line"></text>
            <text class="time">{{ item.endTime }}</text>
          </view>

          <view class="icon">
            <image mode="widthFix" :src="item.img" />
            <view class="content">减脂入门7日食谱-1000Kcal轻量档</view>
          </view>
        </view>
      </view>

      <view class="empty" v-else>无已结束食谱记录</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'myRecipe',

  data() {
    return {
      recipeList: [
        {
          id: 0,
          startTime: '2025-12-29',
          endTime: '2026-01-09',
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/recipes-pic.png',
          status: 1,
          success: false,
        },
      ],
    };
  },

  computed: {
    successRecipeList() {
      return this.recipeList.filter((x) => x.status === 1);
    },

    unSuccessRecipeList() {
      return this.recipeList.filter((x) => x.status !== 1);
    },

    days() {
      return (item) => {
        let days = (new Date() - new Date(item.startTime.replace(/-/g, '/'))) / (24 * 60 * 60 * 1000);
        return Math.ceil(days);
      };
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
