<template>
  <view class="data-report-page">
    <view class="page-title">
      <text>数据报告</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="nav-tab">
      <view
        class="nav-item"
        :class="{ active: selectedTime.id === item.id }"
        v-for="item of timeList"
        :key="item.id"
        @click="selectedTime = item"
      >
        <text class="name">{{ item.name }}</text>
      </view>
    </view>

    <view class="data-detail">
      <view class="data-item">
        <view class="data-title">
          <text>身体指标</text>
          <text>共{{ dataReport.weight_record_days }}天</text>
        </view>

        <view class="data-info">
          <view class="data-info-item">
            <view class="info-title">体重</view>

            <template v-if="dataReport.weight_list && dataReport.weight_list.length">
              <view class="change-list">
                <view class="day1">
                  <text>{{ firstDay.date_time.slice(5, 10) }}</text>
                  <text>{{ lastDay.date_time.slice(5, 10) }}</text>
                </view>

                <view class="day2">
                  <text>{{ firstDay.weight }}公斤</text>
                  <text>{{ lastDay.weight }}公斤</text>
                </view>
              </view>
            </template>

            <view v-else class="empty-recode">
              <text>最近无体重记录</text>
            </view>
          </view>

          <view class="data-info-item">
            <view class="info-title">BMI</view>

            <template v-if="dataReport.weight_list && dataReport.weight_list.length">
              <view class="change-list">
                <view class="day1">
                  <text>{{ firstDay.date_time.slice(5, 10) }}</text>
                  <text>{{ lastDay.date_time.slice(5, 10) }}</text>
                </view>

                <view class="day2">
                  <text>{{ lastDay.date_time.slice(5, 10) }}</text>
                  <text>{{ firstDay.bmi }}</text>
                </view>
              </view>
            </template>

            <view v-else class="empty-recode">
              <text>最近无BMI记录</text>
            </view>
          </view>
        </view>
      </view>

      <view class="data-item">
        <view class="data-title">
          <text>饮食</text>
          <text>共{{ dataReport.meal_record_days }}天</text>
        </view>

        <view class="data-info">
          <view class="data-info-item">
            <view class="info-title" style="background: #dad2ff">平均摄入</view>

            <view class="change-list change-list1" style="background: #dad2ff">
              <view class="day1">
                <text>{{ selectedTime.name }}</text>
                <text>{{ dataReport.calorie_average }}千卡</text>
              </view>

              <view class="day2">
                <text>{{ selectedTime.preName }}</text>
                <text>{{ dataReport.previous_calorie_average }}千卡</text>
              </view>
            </view>
          </view>

          <view class="data-info-item">
            <view class="info-title" style="background: #dad2ff">食物种类</view>

            <view class="change-list change-list1" style="background: #dad2ff">
              <view class="day1">
                <text>{{ selectedTime.name }}</text>
                <text>{{ dataReport.food_num }}千卡</text>
              </view>

              <view class="day2">
                <text>{{ selectedTime.preName }}</text>
                <text>{{ dataReport.previous_food_num }}千卡</text>
              </view>
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
  name: 'dataReport',

  data() {
    return {
      dataReport: {},
      timeList: [
        {
          id: 1,
          name: '本周',
          value: 1,
          preName: '上周',
        },
        {
          id: 2,
          name: '本月',
          value: 2,
          preName: '上月',
        },
        {
          id: 3,
          name: '近三个月',
          value: 3,
          preName: '上三个月',
        },
        {
          id: 4,
          name: '近半年',
          value: 4,
          preName: '上半年',
        },
      ],
      selectedTime: {},
    };
  },

  computed: {
    firstDay() {
      return this.dataReport.weight_list && this.dataReport.weight_list[0];
    },

    lastDay() {
      return this.dataReport.weight_list && this.dataReport.weight_list[this.dataReport.weight_list.length - 1];
    },
  },

  watch: {
    selectedTime() {
      this.getDataReport();
    },
  },

  onLoad() {
    this.selectedTime = this.timeList[0];
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    getDataReport() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/data-report', {
          report_type: this.selectedTime.value,
        })
        .then((res) => {
          uni.hideLoading();
          this.dataReport = res.data;
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
.data-report-page {
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
    margin-bottom: 40rpx;

    .nav-item {
      height: 40rpx;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      &.active {
        border-radius: 20rpx;
        background: #b3a1ff;
      }

      .name {
        padding: 0 20rpx;
        color: #323131;
        font-size: 28rpx;
        position: relative;
        z-index: 1;
      }
    }
  }

  .data-detail {
    padding: 0 40rpx;

    .data-item {
      margin-bottom: 44rpx;

      .data-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28rpx;

        text {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 28rpx;
            color: #323131;
          }

          &:nth-child(2) {
            font-size: 24rpx;
            color: #323131cc;
          }
        }
      }

      .data-info {
        background: #fcffea;
        border-radius: 20rpx;
        padding: 20rpx 12rpx;
        display: flex;
        flex-direction: column;
        gap: 50rpx;

        .data-info-item {
          .info-title {
            display: inline-flex;
            background: #ffffff;
            border-radius: 20rpx 20rpx 0rpx 0rpx;
            padding: 6rpx 12rpx;
            font-size: 24rpx;
            color: #323131;
            position: relative;
          }

          .change-list {
            background: #ffffff;
            border-radius: 0rpx 10rpx 10rpx 10rpx;
            padding: 20rpx;
            display: flex;
            flex-direction: column;
            gap: 20rpx;

            &.change-list1 {
              .day1,
              .day2 {
                &.day1 {
                  font-size: 24rpx;
                  color: #323131;
                }

                &.day2 {
                  font-size: 24rpx;
                  color: #323131cc;
                }
              }
            }

            .day1,
            .day2 {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: space-between;

              &.day1 {
                font-size: 20rpx;
                color: #323131;
              }

              &.day2 {
                font-size: 24rpx;
                color: #323131;
              }
            }
          }
        }
      }
    }
  }
}

.empty-recode {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #00000080;
  background: #ffffff;
  padding: 30rpx 0;
}
</style>
