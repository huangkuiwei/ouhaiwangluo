<template>
  <view class="history-plan-page">
    <view class="page-title">
      <text>历史方案</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="current-plan">
      <view class="plan-title">当前方案</view>

      <view class="plan-box-wrap">
        <view class="plan-box" v-for="item of currentPlanList" :key="item.plan_id">
          <view class="data-wrapper">
            <view class="data">
              <view class="time">
                <text>{{ item.start_date.slice(0, 10) }}</text>
                <text>{{ item.end_date.slice(0, 10) }}</text>
              </view>

              <view class="value">
                <view class="value-item">
                  <text>初始</text>
                  <text>{{ item.plan_initial_weight }}公斤</text>
                </view>

                <view class="value-item">
                  <text>{{ isWeightLoss(item) ? '已减重' : '已增重' }}</text>
                  <text>{{ isWeightLoss(item) ? item.loss_weight : -item.loss_weight }}公斤</text>
                </view>

                <view class="value-item">
                  <text>目标</text>
                  <text>{{ item.plan_target_weight }}公斤</text>
                </view>
              </view>
            </view>

            <view class="tip" @click="$toBack()">
              <text class="progress-tip">当前进度{{ item.progress }}%</text>
              <view class="icon" :class="{ active: item.showDetail }" @click="item.showDetail = !item.showDetail">
                <uni-icons class="back" color="#323131" type="right" size="18"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="history-plan">
      <view class="plan-title">历史方案</view>

      <view class="plan-box-wrap">
        <view class="plan-box" v-for="item of historyPlanList" :key="item.plan_id">
          <view class="data-wrapper">
            <view class="data">
              <view class="progress">
                <text :style="{ width: item.progress + '%' }"></text>
              </view>

              <view class="time">
                <text>{{ item.start_date.slice(0, 10) }}</text>
                <text>{{ item.end_date.slice(0, 10) }}</text>
              </view>

              <view class="value">
                <view class="value-item">
                  <text>初始</text>
                  <text>{{ item.plan_initial_weight }}公斤</text>
                </view>

                <view class="value-item">
                  <text>{{ isWeightLoss(item) ? '已减重' : '已增重' }}</text>
                  <text>{{ isWeightLoss(item) ? item.loss_weight : -item.loss_weight }}公斤</text>
                </view>

                <view class="value-item">
                  <text>目标</text>
                  <text>{{ item.plan_target_weight }}公斤</text>
                </view>
              </view>
            </view>

            <view class="tip" @click="toggleDetail(item)">
              <text class="progress-tip">计划结束时体重：{{ item.current_weight }}公斤</text>
              <view class="icon" :class="{ active: item.showDetail }">
                <uni-icons class="back" color="#323131" type="right" size="18"></uni-icons>
              </view>
            </view>
          </view>

          <view class="weight-data-wrapper" v-if="item.showDetail">
            <view class="chart-title"
              >目标在 <text>{{ item.end_date && item.end_date.slice(0, 10) }}</text> 到
              <text>{{ item.plan_target_weight || 0 }}kg</text></view
            >

            <view class="time-wrapper">
              <view class="time">{{ item.start_date.slice(0, 10) }}</view>

              <view class="loss-data">
                <text
                  >每周{{
                    isWeightLoss(item) ? `减重${item.weekly_loss_weight}` : `增重${-item.weekly_loss_weight}`
                  }}kg</text
                >
              </view>

              <view class="time">{{ item.end_date.slice(0, 10) }}</view>
            </view>

            <view class="weight-data">
              <view class="weight-data-item">
                <text>初始BMI值为：{{ item.plan_initial_bmi || 0 }}</text>
              </view>

              <view class="weight-data-item">
                <text>初始体重值为：{{ item.plan_initial_weight || 0 }}KG</text>
              </view>

              <view class="weight-data-item">
                <text>当前体重值为：{{ item.current_weight || 0 }}KG</text>
              </view>
            </view>

            <view class="options">
              <text class="loss-data2">
                {{ isWeightLoss(item) ? '已减重：' : '已增重：' }}：
                <template v-if="isWeightLoss">
                  {{ Number((item.plan_initial_weight - item.current_weight).toFixed(2)) }}KG
                </template>

                <template v-else>
                  {{ -Number((item.plan_initial_weight - item.current_weight).toFixed(2)) }}KG
                </template>
              </text>

              <text class="delete" @click="deletePlan(item)">删除方案</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'historyPlan',

  data() {
    return {
      historyPlanList: [],
      currentPlanList: [],
    };
  },

  computed: {
    isWeightLoss() {
      return (plan) => {
        return plan.plan_initial_weight - plan.plan_target_weight > 0;
      };
    },
  },

  onShow() {
    this.getHistoryPlanList();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    getHistoryPlanList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/weight-plan/history', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();

          res.data.Items.forEach((item) => {
            // 计算已减体重和进度
            item.loss_weight = Number((item.plan_initial_weight - item.current_weight).toFixed(2));
            item.progress = ((item.loss_weight / (item.plan_initial_weight - item.plan_target_weight)) * 100).toFixed(
              2,
            );

            if (item.progress > 100) {
              item.progress = 100;
            } else if (item.progress < 0) {
              item.progress = 0;
            }

            item.showDetail = false;
          });

          this.historyPlanList = res.data.Items.filter((x) => x.state !== 1);
          this.currentPlanList = res.data.Items.filter((x) => x.state === 1);
        });
    },

    toggleDetail(item) {
      item.showDetail = !item.showDetail;
    },

    /**
     * 删除计划
     */
    deletePlan(item) {
      uni.showModal({
        title: '温馨提示',
        content: '确定要删除计划吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '加载中...',
              mask: true,
            });

            $http
              .post('api/diet-info/weight-plan/delete', {
                plan_id: item.plan_id,
              })
              .then(() => {
                uni.hideLoading();

                uni.showToast({
                  title: '删除成功',
                  icon: 'none',
                  mask: true,
                });

                this.getHistoryPlanList();
              });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss">
page {
  background: #ffffff;
}
</style>

<style scoped lang="scss">
.history-plan-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 28rpx;
  }

  .current-plan,
  .history-plan {
    &.current-plan {
      .data-wrapper {
        background: #dad2ff !important;
      }
    }

    padding: 0 24rpx;
    position: relative;
    margin-bottom: 40rpx;

    .plan-title {
      font-size: 28rpx;
      color: #000000;
      margin-bottom: 20rpx;
    }

    .plan-box-wrap {
      .plan-box {
        background: #fcffea;
        border-radius: 20rpx;

        .data-wrapper {
          background: #f3f3f3;
          padding: 20rpx;
          border-radius: 20rpx;

          &:not(:last-child) {
            margin-bottom: 20rpx;
          }

          .data {
            .time {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 36rpx;

              text {
                font-size: 24rpx;
                color: #323131;
              }
            }

            .value {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 90rpx;
              margin-bottom: 32rpx;

              .value-item {
                &:nth-child(1),
                &:nth-child(3) {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 30rpx;

                  text {
                    &:nth-child(1) {
                      width: 120rpx;
                      height: 40rpx;
                      background: #ffffff;
                      border-radius: 60rpx;
                      font-size: 24rpx;
                      color: #323131;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }

                    &:nth-child(2) {
                      font-size: 32rpx;
                      color: #323131;
                    }
                  }
                }

                &:nth-child(2) {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 30rpx;

                  text {
                    &:nth-child(1) {
                      width: 120rpx;
                      height: 40rpx;
                      background: #e8f480;
                      border-radius: 60rpx;
                      font-size: 24rpx;
                      color: #323131;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }

                    &:nth-child(2) {
                      font-weight: 600;
                      font-size: 36rpx;
                      color: #323131;
                    }
                  }
                }
              }
            }
          }

          .tip {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .progress-tip {
              font-size: 24rpx;
              color: #323131;
            }

            .icon {
              &.active {
                transform: rotate(90deg);
              }
            }
          }
        }

        .weight-data-wrapper {
          padding: 28rpx 20rpx;

          .chart-title {
            font-size: 24rpx;
            color: #313030;
            margin-bottom: 16rpx;

            text {
              color: #000000;
              padding: 0 10rpx;
            }
          }

          .time-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20rpx;

            .time {
              font-size: 20rpx;
              color: #000000;
            }

            .loss-data {
              display: flex;
              align-items: center;
              justify-content: center;

              text {
                padding: 8rpx;
                background: #ffffff;
                border-radius: 40rpx;
                font-size: 20rpx;
                color: #000000;
              }
            }
          }

          .weight-data {
            display: flex;
            flex-direction: column;
            gap: 20rpx;
            margin-bottom: 20rpx;

            .weight-data-item {
              font-size: 24rpx;
              color: #000000;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
          }

          .options {
            font-size: 20rpx;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .loss-data2 {
              height: 40rpx;
              padding: 0 20rpx;
              background: #d4e86c;
              border-radius: 40rpx;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .delete {
              height: 40rpx;
              padding: 0 72rpx;
              background: #f3f3f3;
              border-radius: 40rpx;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
    }
  }
}
</style>
