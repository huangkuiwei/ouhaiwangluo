<template>
  <view class="reset-plan-page">
    <view class="page-title">
      <text>创建计划</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="setting-list">
      <view class="box">
        <view class="item">
          <text class="label">目标体重</text>

          <view class="value" @click="openUpdateTargetWeightDialog">
            <text class="filed">{{ targetWeight || 0 }}公斤</text>
            <uni-icons class="back" color="#323131" type="right" size="18"></uni-icons>
          </view>
        </view>
      </view>

      <view class="evaluation">
        <calendar
          ref="calendarRef"
          :initialWeight="initialWeight"
          :targetWeight="targetWeight"
          @selectDayChange="onSelectDayChange"
        />

        <view class="expected-wrap">
          <view class="expected" v-if="planData1">
            <view class="line1">
              <view class="left">
                预计
                <text>{{ planData1.week || 0 }}</text>
                周
              </view>

              <view class="right">
                每周{{ isWeightLoss ? '减重' : '增重' }}约
                <text>{{ planData1.weight || 0 }}</text>
                公斤
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="resetPlan">创建计划</view>

    <uni-popup ref="updateTargetWeightDialog">
      <view class="update-target-weight-data-dialog">
        <view class="title">目标体重</view>

        <view class="weight-list">
          <view class="list">
            <picker-view
              indicator-style="height: 60rpx;"
              style="width: 100%; height: 180rpx"
              :value="changedTargetWeight"
              @change="changedTargetWeight = $event.detail.value"
            >
              <picker-view-column>
                <view
                  class="item"
                  :class="{
                    active: changedTargetWeight[0] === index,
                  }"
                  v-for="(item, index) in rulerLineList1"
                  :key="index"
                >
                  <text class="value">{{ item }}</text>
                </view>
              </picker-view-column>
            </picker-view>
          </view>

          <text class="unit">公斤</text>
        </view>

        <view class="btn" @click="changedTargetWeightSubmit">确定</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import $http from '@/utils/http';
import Calendar from '@/components/calendar.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'resetPlan',

  components: {
    Calendar,
  },

  data() {
    let rulerLineList = [];
    let rulerLineList1 = [];

    for (let i = 30; i < 301; i++) {
      rulerLineList.push(i);
    }

    for (let i = 0; i < 401; i++) {
      rulerLineList1.push(Number((i * 0.5).toFixed(1)));
    }

    return {
      targetWeight: null,
      initialWeight: null,
      rulerLineList,
      rulerLineList1,
      planData: {},
      planData1: {},
      changedTargetWeight: [0],
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),

    isWeightLoss() {
      return this.initialWeight - this.targetWeight > 0;
    },
  },

  onLoad() {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    });

    this._getUserDetailInfo().then(() => {
      uni.hideLoading();

      this.initialWeight = this.userDetailInfo.current_weight;
      this.targetWeight = this.userDetailInfo.target_weight;

      setTimeout(() => {
        let weight = Math.abs(this.userDetailInfo.current_weight - this.targetWeight);
        this.$refs.calendarRef.currentDate = Date.now() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 0.5);

        let currentDate = new Date(this.$refs.calendarRef.currentDate);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
        const date = currentDate.getDate() > 9 ? currentDate.getDate() : `0${currentDate.getDate()}`;

        this.$refs.calendarRef.selectedDate = `${year}/${month}/${date}`;

        this.planData = {
          plan_initial_weight: this.initialWeight,
          end_date: this.$refs.calendarRef.selectedDate,
          start_date: new Date().format().slice(0, 10),
        };
      });
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    onSelectDayChange() {
      if (this.$refs.calendarRef) {
        let selectedDate = this.$refs.calendarRef.selectedDate;

        let now = Date.now();
        let selectDate = new Date(selectedDate).getTime();
        let day = Math.ceil((selectDate - now) / (1000 * 60 * 60 * 24));
        let week = day / 7;

        this.planData1 = {
          day,
          week: Number(week.toFixed(1)),
          weight: Number((Math.abs(this.initialWeight - this.targetWeight) / week).toFixed(2)),
        };
      }
    },

    resetPlan() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/weight-plan/add', {
          target_weight: this.targetWeight,
          end_date: new Date(this.$refs.calendarRef.selectedDate).format(),
        })
        .then(() => {
          uni.hideLoading();
          this.$toRedirect('/pages/weightManagementPlan/weightManagementPlan');
        });
    },

    openUpdateTargetWeightDialog() {
      let index = this.rulerLineList1.findIndex((item) => Number(item) === Number(this.targetWeight));

      if (index !== -1) {
        this.changedTargetWeight = [index];
      }

      this.$refs.updateTargetWeightDialog.open();
    },

    changedTargetWeightSubmit() {
      this.targetWeight = this.rulerLineList1[this.changedTargetWeight[0]];
      this.$refs.updateTargetWeightDialog.close();
      this.onSelectDayChange();
    },
  },
};
</script>

<style lang="scss">
page {
  background: #ffffff;
  height: 100%;
}
</style>

<style scoped lang="scss">
.reset-plan-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 8rpx;
  }

  .setting-list {
    flex-grow: 1;
    padding: 0 24rpx;

    .box {
      background: #ffffff;
      border-radius: 10rpx;
      border: 4rpx solid #323131;
      padding: 24rpx 20rpx;
      margin-bottom: 20rpx;

      .item {
        display: flex;
        align-items: center;

        &:not(:last-child) {
          padding-bottom: 30rpx;
          margin-bottom: 30rpx;
          border-bottom: 1px solid #f6f7fb;
        }

        .label {
          font-size: 28rpx;
          color: #323131;
          flex-grow: 1;
        }

        .value {
          display: flex;
          align-items: center;

          .filed {
            font-size: 28rpx;
            color: #323131;
            margin-right: 10rpx;
          }
        }
      }
    }

    .evaluation {
      .expected-wrap {
        margin-top: 20rpx;

        .expected {
          width: 702rpx;
          height: 120rpx;
          background: #dad2ff;
          border-radius: 10rpx;
          padding: 32rpx 20rpx;

          .line1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 24rpx;
            color: #323131;

            view {
              display: flex;
              align-items: center;

              text {
                width: 100rpx;
                height: 50rpx;
                background: #ffffff;
                border-radius: 10rpx 10rpx 10rpx 10rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28rpx;
                color: #323131;
                margin: 0 6rpx;
              }
            }
          }
        }
      }
    }
  }

  .submit-btn {
    width: 654rpx;
    margin: 0 auto 100rpx;
    height: 80rpx;
    background: #e8f480;
    border-radius: 60rpx;
    font-weight: 600;
    font-size: 28rpx;
    color: #323131;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.update-target-weight-data-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 32rpx 24rpx 48rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 114rpx;
  }

  .weight-list {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 116rpx;

    .list {
      width: 160rpx;

      picker-view {
        width: 100%;
        margin-right: 8rpx;

        .item {
          width: 100%;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            background: #f3f3f3;
            border-radius: 20rpx;
            font-weight: 600;
            font-size: 32rpx;
            color: #604fa6;
          }
        }
      }
    }

    .unit {
      font-size: 28rpx;
      color: #323131;
      padding: 0 16rpx 12rpx;
      position: relative;
    }
  }

  .btn {
    height: 80rpx;
    background: #e8f480;
    border-radius: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #323131;
  }
}
</style>
