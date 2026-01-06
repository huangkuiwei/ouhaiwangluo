<template>
  <view class="weight-data-page">
    <view class="page-title">
      <text>体重数据</text>

      <view class="back" @click="back">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="data-charts">
      <view class="bmi">
        <view class="value1">
          <text>初始BMI值为：{{ userDetailInfo.initial_bmi }}</text>
          <text class="no-normal" v-if="userDetailInfo.initial_bmi > 27.9">肥胖</text>
          <text class="no-normal" v-else-if="userDetailInfo.initial_bmi > 24.9">超重</text>
          <text class="normal" v-else-if="userDetailInfo.initial_bmi > 18.5">正常</text>
          <text class="no-normal" v-else>偏瘦</text>
        </view>

        <view class="value2">
          <text>根据您的身高体重测算，推荐BMI范围：</text>
          <text>18.5-24.9</text>
        </view>
      </view>

      <view class="chart1-box">
        <view class="detail">
          <view class="item">
            <view class="value">
              <text>初始体重</text>
              <text>{{ userDetailInfo.initial_weight }}公斤</text>
            </view>

            <!-- <image -->
            <!--   @click="updateWeightData(1)" -->
            <!--   mode="widthFix" -->
            <!--   src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightData/edit.png" -->
            <!-- /> -->
          </view>

          <view class="item">
            <view class="value">
              <text>目标体重</text>
              <text>{{ userDetailInfo.target_weight }}公斤</text>
            </view>

            <!-- <image -->
            <!--   @click="updateWeightData(2)" -->
            <!--   mode="widthFix" -->
            <!--   src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/weightData/edit.png" -->
            <!-- /> -->
          </view>

          <view class="item">
            <view class="value">
              <text>最新体重</text>
              <text>{{ userDetailInfo.current_weight }}公斤</text>
            </view>

            <image
              @click="updateWeightData(3)"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/weightData/icon1.png"
            />
          </view>
        </view>

        <view class="chart">
          <l-echart ref="chart1Ref" @finished="init1" />

          <view class="progress-tip">
            <text v-if="isWeightLoss">累计减重（公斤）</text>
            <text v-else>累计增肌（公斤）</text>
            <text>{{ (isWeightLoss ? userDetailInfo.weight_loss : -userDetailInfo.weight_loss).toFixed(2) }}</text>
            <text>{{ progress === 100 ? '目标已完成' : `目标完成${progress}%` }}</text>
          </view>
        </view>
      </view>

      <view class="plan">
        <view class="btn1" v-if="hasCompletedPlan" @click="$toRouter('/pages/addPlan/addPlan')">创建新计划</view>
        <view class="btn1" v-else @click="previewPlan">查看计划</view>
      </view>

      <view class="chart2-box">
        <view class="chart-title">体重变化曲线</view>

        <view class="chart">
          <l-echart ref="chart2Ref" @finished="init2" />
        </view>
      </view>

      <view class="chart3-box">
        <view class="chart-title">BMI变化曲线</view>

        <view class="chart">
          <l-echart ref="chart3Ref" @finished="init3" />
        </view>
      </view>
    </view>

    <uni-popup ref="updateWeightDataDialog">
      <view class="update-target-weight-data-dialog">
        <view class="title">更新最新体重</view>

        <view class="weight-list">
          <view class="list">
            <picker-view
              indicator-style="height: 60rpx;"
              style="width: 100%; height: 180rpx"
              :value="weightData.current_weight"
              @change="weightData.current_weight = $event.detail.value"
            >
              <picker-view-column>
                <view
                  class="item"
                  :class="{
                    active: weightData.current_weight[0] === index,
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

        <view class="btn" @click="submit">确定</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';

let chart1 = null;
let chart2 = null;
let chart3 = null;

export default {
  name: 'weightData',

  data() {
    let rulerLineList1 = [];

    for (let i = 0; i < 401; i++) {
      rulerLineList1.push(Number((i * 0.5).toFixed(1)));
    }

    return {
      userDetailInfo: {},
      homeWeightPlanData: {},
      hasCompletedPlan: false,
      weightData: {},
      progress: 0,
      updateType: 1,
      rulerLineList1,
      option1: {
        color: ['#DAD2FF', '#FEFFF7'],
        series: [
          {
            type: 'pie',
            radius: '100%',
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            title: {
              show: false,
            },
            detail: {
              show: false,
            },
            data: [
              {
                value: 0,
              },
              {
                value: 0,
              },
            ],
          },
        ],
      },
      option2: {
        backgroundColor: '#FCFFEA',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          show: false,
        },
        grid: {
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          // boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false, // 这里设置为 false 以隐藏 y 轴方向的网格线（横线）
          },
        },
        series: [
          {
            name: '体重',
            label: {
              show: true,
              position: 'top',
            },
            data: [],
            type: 'line',
            color: '#D54242',
            areaStyle: {
              color: '#FFEDD700',
            },
          },
        ],
      },
      option3: {
        backgroundColor: '#FCFFEA',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          show: false,
        },
        grid: {
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          // boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false, // 这里设置为 false 以隐藏 y 轴方向的网格线（横线）
          },
        },
        series: [
          {
            name: 'BMI',
            label: {
              show: true,
              position: 'top',
            },
            data: [],
            type: 'line',
            color: '#DAD2FF',
            areaStyle: {
              color: '#CEF2E900',
            },
          },
        ],
      },
    };
  },

  onShow() {
    this.getWeightData();
    this.getHomeWeightPlan();
  },

  computed: {
    isWeightLoss() {
      return this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight > 0;
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    async init1() {
      chart1 = await this.$refs.chart1Ref.init(echarts);
      chart1.setOption(this.option1);
    },

    async init2() {
      chart2 = await this.$refs.chart2Ref.init(echarts);
      chart2.setOption(this.option2);
    },

    async init3() {
      chart3 = await this.$refs.chart3Ref.init(echarts);
      chart3.setOption(this.option3);
    },

    back() {
      // eslint-disable-next-line no-undef
      let pages = getCurrentPages();

      if (pages[pages.length - 2].route === 'pages/my/my') {
        this.$toBack();
        return;
      }

      if (this.hasCompletedPlan) {
        this.$toSwitch('/pages/index/index');
        return;
      }

      this.$toBack();
    },

    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.homeWeightPlanData = res.data;
        this.hasCompletedPlan = res.data.state !== 1;
      });
    },

    getWeightData(showLoading = true) {
      if (showLoading) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });
      }

      $http
        .post('api/diet-info/weight-data', {
          days: 30,
        })
        .then((res) => {
          if (showLoading) {
            uni.hideLoading();
          }

          this.userDetailInfo = res.data;
          this.progress = Number(
            (
              (this.userDetailInfo.weight_loss /
                (this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight)) *
              100
            ).toFixed(2),
          );

          if (this.progress > 100) {
            this.progress = 100;
          } else if (this.progress < 0) {
            this.progress = 0;
          }

          this.option1.series[0].data[0].value = this.progress;
          this.option1.series[0].data[1].value = 100 - this.progress;

          setTimeout(() => {
            chart1.setOption(this.option1);
          }, 500);

          let weightList = res.data.weight_list.map((item) => item.weight).reverse();
          let bmiList = res.data.weight_list.map((item) => item.bmi).reverse();
          let timeList = res.data.weight_list.map((item) => item.date_time.slice(6, 10)).reverse();

          this.option2.series[0].data = weightList;
          this.option2.xAxis.data = timeList;

          this.option3.series[0].data = bmiList;
          this.option3.xAxis.data = timeList;

          setTimeout(() => {
            chart2.setOption(this.option2);
            chart3.setOption(this.option3);
          }, 500);
        });
    },

    previewPlan() {
      this.$toRouter('/pages/weightManagementPlan/weightManagementPlan');
    },

    updateWeightData(type) {
      this.updateType = type;
      this.weightData = { ...this.userDetailInfo };

      let index = this.rulerLineList1.findIndex((item) => Number(item) === Number(this.userDetailInfo.current_weight));

      if (index !== -1) {
        this.weightData.current_weight = [index];
      }

      this.$refs.updateWeightDataDialog.open();
    },

    submit() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      if (this.updateType === 1 || this.updateType === 2) {
        $http
          .post('api/diet-info/user-info/update', {
            initial_weight: this.weightData.initial_weight,
            target_weight: this.weightData.target_weight,
          })
          .then(() => {
            this.$refs.updateWeightDataDialog.close();
            uni.hideLoading();
            this.getWeightData(false);
            this.getHomeWeightPlan();

            uni.showToast({
              title: '更新成功',
              icon: 'none',
            });
          });
      } else {
        $http
          .post('api/diet-info/user-weight/update', {
            weight: this.rulerLineList1[this.weightData.current_weight[0]],
          })
          .then(() => {
            this.$refs.updateWeightDataDialog.close();
            uni.hideLoading();
            this.getWeightData(false);
            this.getHomeWeightPlan();

            uni.showToast({
              title: '更新成功',
              icon: 'none',
            });
          });
      }
    },
  },
};
</script>

<style>
page {
  background: #ffffff url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/dataReport/bg01.png') left top/100%
    200rpx no-repeat;
}
</style>

<style scoped lang="scss">
.weight-data-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 42rpx;
  }

  .data-charts {
    padding: 36rpx 24rpx 80rpx;

    .bmi {
      margin-bottom: 16rpx;

      .value1 {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;

        text {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 28rpx;
            color: #323131;
            margin-right: 20rpx;
          }

          &:nth-child(2) {
            padding: 8rpx 16rpx;
            height: 40rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
            color: #323131;
            display: flex;
            align-items: center;
            justify-content: center;

            &.normal {
              background: #e8f480;
            }

            &.no-normal {
              background: #9faa43;
            }
          }
        }
      }

      .value2 {
        display: flex;
        align-items: center;

        text {
          font-size: 20rpx;
          color: #323131;

          &:nth-child(2) {
            font-weight: 600;
          }
        }
      }
    }

    .chart1-box {
      background: #fcffea;
      border-radius: 20rpx;
      padding: 32rpx 0;
      display: flex;
      flex-direction: column;
      margin-bottom: 20rpx;

      .detail {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 108rpx;
        margin-bottom: 38rpx;
        position: relative;
        z-index: 9;

        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;

          .value {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            text {
              &:nth-child(1) {
                font-size: 24rpx;
                color: #323131;
                margin-bottom: 22rpx;
              }

              &:nth-child(2) {
                font-weight: 600;
                font-size: 32rpx;
                color: #323131;
                padding-bottom: 12rpx;
                border-bottom: 2rpx solid #323131;
              }
            }
          }

          image {
            position: absolute;
            bottom: 15rpx;
            right: -40rpx;
            width: 26rpx;
          }
        }
      }

      .chart {
        align-self: center;
        width: 384rpx;
        height: 384rpx;
        position: relative;

        .progress-tip {
          position: absolute;
          left: 0;
          right: 0;
          top: 20rpx;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12rpx;

          text {
            &:nth-child(1) {
              font-size: 24rpx;
              color: #323131;
            }

            &:nth-child(2) {
              font-weight: 600;
              font-size: 40rpx;
              color: #323131;
            }

            &:nth-child(3) {
              font-size: 24rpx;
              color: #323131;
            }
          }
        }
      }
    }

    .plan {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20rpx;
      margin-bottom: 40rpx;

      view {
        width: 100%;
        height: 80rpx;
        background: #dad2ff;
        border-radius: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #323131;
      }
    }

    .chart2-box,
    .chart3-box {
      margin-bottom: 40rpx;

      .chart-title {
        font-weight: 600;
        font-size: 28rpx;
        color: #323131;
        margin-bottom: 20rpx;
      }

      .chart {
        background: #ffffff;
        border-radius: 20rpx;
      }
    }
  }

  .update-weight-data-dialog {
    background: #ffffff;
    width: 589rpx;
    border-radius: 30rpx;
    padding: 40rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .title {
      font-weight: 500;
      font-size: 32rpx;
      color: #111111;
      margin-bottom: 50rpx;
    }

    .input-box {
      width: 410rpx;
      height: 103rpx;
      background: #ffffff;
      border-radius: 20rpx;
      border: 2px solid #f4f4f4;
      display: flex;
      align-items: center;
      color: #111111;
      margin-bottom: 50rpx;

      input {
        font-weight: 500;
        width: 260rpx;
        font-size: 48rpx;
        text-align: center;
      }

      text {
        flex-grow: 1;
        font-size: 30rpx;
      }
    }

    .submit {
      width: 410rpx;
      height: 90rpx;
      background: #0abf92;
      border-radius: 45rpx;
      font-size: 30rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close {
      position: absolute;
      right: 20rpx;
      top: 30rpx;
    }
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
