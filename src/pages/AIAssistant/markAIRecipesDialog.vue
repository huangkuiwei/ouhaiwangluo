<template>
  <uni-popup ref="markAIRecipesPopup" type="bottom" :safe-area="false">
    <view class="mark-AI-recipes-dialog">
      <view class="title">AI定制食谱</view>

      <view class="tip"
        >AI会根据您的个人信息和历史饮食记录，为您定制专属的个性化食谱。为了让AI更好的进行分析，建议您完善以下信息后开始创建。</view
      >

      <view class="filed">
        <view class="filed-item">
          <text class="point"></text>
          <text class="label">性别、年龄、身高、体重</text>
          <picker @change="value1 = $event.detail.value" :value="value1" range-key="name" :range="picker1">
            <view>
              <text>计划目标：</text>
              <text class="value">{{ picker1[value1].name }}</text>
            </view>
          </picker>

          <view class="tip2">*点击修改</view>
        </view>

        <view class="filed-item">
          <text class="point"></text>
          <text class="label">体重目标</text>
          <picker @change="value2 = $event.detail.value" :value="value2" range-key="name" :range="picker2">
            <view>
              <text>计划天数：</text>
              <text class="value">{{ picker2[value2].name }}</text>
              <text style="margin-left: 6rpx">天</text>
            </view>
          </picker>

          <view class="tip2">*点击修改</view>
        </view>

        <view class="filed-item">
          <text class="point"></text>
          <text class="label">每日热量目标、运动习惯、饮食习惯</text>
          <text style="width: 210rpx"></text>
        </view>
      </view>

      <view class="demand">
        <view class="demand-title">更多食谱需求:</view>

        <view class="demand-box">
          <textarea
            :maxlength="-1"
            :value="demand"
            @input="demand = $event.detail.value"
            placeholder="可选填你额外的食谱需求。 例如:我不能吃辣、我爱吃面食、不想吃早餐、我有高血压、我乳糖不耐受"
          />

          <view class="btn" @click="submit">创建AI专属食谱</view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'markAIRecipesDialog',

  props: {},

  data() {
    return {
      demand: '',
      value1: 0,
      value2: 0,
      picker1: [
        {
          id: 0,
          name: '减脂',
        },
        {
          id: 1,
          name: '减重',
        },
        {
          id: 2,
          name: '提高健康',
        },
      ],
      picker2: [
        {
          id: 0,
          name: '7',
        },
        {
          id: 1,
          name: '13',
        },
        {
          id: 2,
          name: '3',
        },
      ],
    };
  },

  methods: {
    open() {
      this.$refs.markAIRecipesPopup.open();
    },

    close() {
      this.$refs.markAIRecipesPopup.close();
    },

    // TODO 提交AI定制食谱
    submit() {},
  },
};
</script>

<style scoped lang="scss">
.mark-AI-recipes-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 60rpx 60rpx 0 0;
  padding: 32rpx 20rpx 60rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 48rpx;
  }

  .tip {
    font-size: 20rpx;
    color: #333333;
    line-height: 28rpx;
    margin-bottom: 20rpx;
  }

  .filed {
    display: flex;
    flex-direction: column;
    gap: 40rpx;
    margin-bottom: 100rpx;

    .filed-item {
      display: flex;
      align-items: center;
      position: relative;

      &:nth-child(2) {
        .point,
        .label {
          position: relative;
          top: -40rpx;
        }
      }

      &:nth-child(3) {
        .point,
        .label {
          position: relative;
          top: -70rpx;
        }
      }

      .point {
        width: 20rpx;
        height: 20rpx;
        background: #b3a1ff;
        border-radius: 50%;
        margin-right: 12rpx;
      }

      .label {
        font-size: 20rpx;
        color: #313030;
        flex-grow: 1;
      }

      picker {
        view {
          font-size: 20rpx;
          color: #313030;
          display: flex;
          align-items: center;
          width: 210rpx;

          .value {
            height: 40rpx;
            width: 80rpx;
            background: #f3f3f3;
            border-radius: 10rpx;
            font-weight: bold;
            font-size: 20rpx;
            color: #604fa6;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .tip2 {
        position: absolute;
        right: 30rpx;
        bottom: -24rpx;
        color: #31303080;
        font-size: 18rpx;
      }
    }
  }

  .demand {
    .demand-title {
      font-size: 24rpx;
      color: #313030;
      margin-bottom: 8rpx;
    }

    .demand-box {
      background: #f3f3f3;
      padding: 20rpx;
      border-radius: 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      textarea {
        width: 100%;
        height: 200rpx;
        font-size: 20rpx;
        color: #313030;
        margin-bottom: 20rpx;
      }

      .btn {
        width: 560rpx;
        height: 60rpx;
        background: #e8f480;
        border-radius: 60rpx;
        font-size: 24rpx;
        color: #313030;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
