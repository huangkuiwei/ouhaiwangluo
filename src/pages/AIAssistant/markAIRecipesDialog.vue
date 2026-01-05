<template>
  <uni-popup ref="markAIRecipesPopup" type="bottom" :safe-area="false">
    <view class="mark-AI-recipes-dialog">
      <view class="title">{{ reGen ? '重新生成食谱' : 'AI定制食谱' }}</view>

      <view class="tip"
        >AI会根据您的个人信息和历史饮食记录，为您定制专属的个性化食谱。为了让AI更好的进行分析，建议您完善以下信息后开始创建。</view
      >

      <view class="filed">
        <view class="filed-item">
          <text class="point"></text>
          <text class="label">性别、年龄、身高、体重</text>
          <picker @change="onWeightChange" :value="value1" :range="picker1">
            <view>
              <text>计划目标：</text>
              <text class="value">{{ picker1[value1] }}</text>
              <text style="margin-left: 6rpx">KG</text>
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
import { mapState } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'markAIRecipesDialog',

  props: {
    reGen: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    let picker1 = [];

    for (let i = 0; i < 401; i++) {
      picker1.push(Number((i * 0.5).toFixed(1)));
    }

    return {
      demand: '',
      value1: 0,
      value2: 0,
      picker1,
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
      lastPlanData: {},
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
  },

  methods: {
    open() {
      let index = this.picker1.findIndex((item) => Number(item) === Number(this.userDetailInfo.target_weight));

      if (index !== -1) {
        this.value1 = index;
      }

      this.$refs.markAIRecipesPopup.open();
      this.getLastPlanData();
    },

    close() {
      this.$refs.markAIRecipesPopup.close();
    },

    onWeightChange($event) {
      this.value1 = Number($event.detail.value);
    },

    getLastPlanData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .get(
          'api/diet-info/weight-plan/last',
          {},
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this.lastPlanData = res.data;
        });
    },

    submit() {
      if (!this.demand.trim()) {
        uni.showToast({
          title: '请填写食谱需求',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(this.reGen ? 'api/diet-info/regenerate-recipes-vip' : 'api/diet-info/generate-recipes-vip', {
          target_weight: this.picker1[this.value1],
          day: this.picker2[this.value2].name,
          des: this.demand,
          plan_id: this.lastPlanData.plan_id,
        })
        .then(() => {
          uni.hideLoading();
          this.close();

          uni.showModal({
            title: '温馨提示',
            content: 'AI食谱正在生成中，需要几分钟时间，请稍后刷新页面查看',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                this.$emit('success');
              }
            },
          });
        });
    },
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
          width: 220rpx;

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
