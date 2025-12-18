<template>
  <view class="index-page">
    <view class="page-title">首页</view>

    <view class="banner"></view>

    <view class="progress-container" @click="jumpAi(jkzsChat)">
      <view class="time">
        <text>第</text>
        <text>{{ homeWeightPlanData.useWeek || '-' }}/{{ homeWeightPlanData.totalWeek || '-' }}</text>
        <text>周</text>
      </view>

      <!-- TODO 状态 -->
      <view class="status">创建计划</view>

      <view class="chart">
        <view class="left">
          <view class="number">
            <text>{{ homeWeightPlanData.plan_initial_weight.toFixed(2) }}</text>
            <text>公斤</text>
          </view>
          <text class="label">初始</text>
        </view>

        <view class="center">
          <view class="number">
            <text v-if="isWeightLoss">{{
              ((homeWeightPlanData && homeWeightPlanData.weight_loss) || 0).toFixed(2)
            }}</text>
            <text v-else>{{ ((homeWeightPlanData && -homeWeightPlanData.weight_loss) || 0).toFixed(2) }}</text>
            <text>公斤</text>
          </view>

          <text class="label">{{ isWeightLoss ? '已减去' : '已增肌' }}</text>
        </view>

        <view class="right">
          <view class="number">
            <text>{{ homeWeightPlanData.plan_target_weight.toFixed(2) }}</text>
            <text>公斤</text>
          </view>
          <text class="label">目标</text>
        </view>

        <view class="chart-box-wrap">
          <image
            class="bg1"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/progress-icon.png"
          />

          <image
            class="bg2"
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg2.png"
          />

          <view class="chart-box">
            <l-echart ref="chartRef" @finished="initChart" />
          </view>
        </view>
      </view>
    </view>

    <view class="get-way-btn" @click="goWeightManage">
      <image
        v-if="homeWeightPlanData && homeWeightPlanData.state === 1"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/get-way-btn2.png"
      />

      <image
        v-else
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/home/get-way-btn.png"
      />
    </view>

    <custom-tab-bar />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import { verifyIsLogin } from '@/utils';

let chart = null;

export default {
  name: 'indexPage',

  data() {
    return {
      aiChartList: [],
      jkzsChat: {},
      homeWeightPlanData: null,
      recordData: null,
      option: {
        series: [
          {
            type: 'gauge',
            startAngle: 198,
            endAngle: -18,
            min: 0,
            max: 100,
            splitNumber: 12,
            itemStyle: {
              color: '#D4E86C',
            },
            progress: {
              show: true,
              width: 12,
            },
            pointer: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                width: 12,
                color: [[1, '#E8F480']],
              },
            },
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
            ],
          },
        ],
      },
    };
  },

  onShow() {
    this.initData();
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
    ...mapGetters('app', ['isLogin']),

    isWeightLoss() {
      if (!this.homeWeightPlanData) {
        return true;
      }

      return this.homeWeightPlanData.plan_initial_weight - this.homeWeightPlanData.plan_target_weight > 0;
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    /**
     * 初始化数据
     */
    async initData() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      this.getAiChartList();
      await this.getHomeWeightPlan().catch(() => {});
      await this._getUserDetailInfo().catch(() => {});

      uni.hideLoading();
    },

    /**
     * 初始化进度条图表数据
     */
    async initChart() {
      // chart 图表实例不能存在data里
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
    },

    /**
     * 获取首页体重相关数据
     */
    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        if (res.data) {
          let totalWeek =
            (new Date(res.data.end_date.replace(/-/g, '/')) - new Date(res.data.start_date.replace(/-/g, '/'))) /
            (1000 * 3600 * 24 * 7);
          let useWeek = (new Date() - new Date(res.data.start_date.replace(/-/g, '/'))) / (1000 * 3600 * 24 * 7);
          res.data.totalWeek = Math.ceil(totalWeek);
          res.data.useWeek = Math.ceil(useWeek);
        }

        this.homeWeightPlanData = res.data;

        if (this.homeWeightPlanData) {
          // 更新图表
          let allWeight = this.homeWeightPlanData.plan_initial_weight - this.homeWeightPlanData.plan_target_weight;
          let yetWeight = this.homeWeightPlanData.weight_loss;
          let ratio = Math.floor((yetWeight / allWeight) * 100);

          if (ratio < 0) {
            ratio = 0;
          } else if (ratio > 100) {
            ratio = 100;
          }

          this.option.series[0].data[0].value = ratio;

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
        } else {
          this.option.series[0].data[0].value = 0;

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
        }
      });
    },

    /**
     * 获取 ai 搭子列表
     */
    getAiChartList() {
      $http
        .get('api/baseai/agent-list')
        .then((res) => {
          let jkzsChatIndex = res.data.findIndex((item) => item.id === 10000);

          if (jkzsChatIndex !== -1) {
            this.jkzsChat = res.data[jkzsChatIndex];
          }

          res.data.splice(jkzsChatIndex, 1);
          this.aiChartList = res.data;
        })
        .catch(() => {
          this.aiChartList = [];
        });
    },

    /**
     * 跳转创建计划页
     */
    addPlan() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      // 创建计划
      this.$toRouter('/pages/addPlan/addPlan');
    },

    /**
     * 跳转计划管理页
     */
    goWeightManage() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
        this.$toRouter('/pages/addPlan/addPlan');
        return;
      }

      this.$toRouter('/pages/weightManagementPlan/weightManagementPlan');
    },

    /**
     * 跳转 AI 搭子聊天界面
     */
    jumpAi(item) {
      // verifyIsLogin();

      if (item.id === 10000) {
        this.$toRouter('/pages/healthAssistant/healthAssistant', `agent_id=${item.id}&name=${item.name}`);
        return;
      }

      this.$toRouter('/pages/aiChat/aiChat', `agent_id=${item.id}&name=${item.name}`);
    },
  },
};
</script>

<style scoped lang="scss">
.index-page {
  padding: 0 24rpx;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 28rpx;
  }

  .progress-container {
    width: 100%;
    height: 320rpx;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg1.png?t=123') left top/100% 100%
      no-repeat;
    position: relative;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .time {
      font-size: 20rpx;
      color: #000000;
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      text {
        &:nth-child(2) {
          margin: 0 8rpx;
          padding: 4rpx 6rpx;
          background: #ffffff;
          border-radius: 6rpx 6rpx 6rpx 6rpx;
          font-weight: 600;
        }
      }
    }

    .status {
      padding: 8rpx 10rpx;
      height: 40rpx;
      background: #fcffea;
      border-radius: 60rpx 60rpx 60rpx 60rpx;
      font-size: 20rpx;
      color: #000000;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .chart {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 92rpx 8rpx 0;

      .left,
      .right,
      .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12rpx;
        color: #000000;
        position: relative;
        z-index: 9;

        &.center {
          align-items: center;
        }

        .number {
          display: flex;
          align-items: center;
          gap: 4rpx;

          text {
            &:nth-child(1) {
              font-weight: 600;
              font-size: 32rpx;
            }

            &:nth-child(2) {
              font-size: 20rpx;
            }
          }
        }

        .label {
          margin-left: 16rpx;
          font-size: 24rpx;
        }
      }

      .chart-box-wrap {
        position: absolute;
        top: -40rpx;
        left: 170rpx;
        width: 310rpx;

        .bg1 {
          width: 100%;
          position: absolute;
          top: 0;
        }

        .bg2 {
          width: 172rpx;
          position: absolute;
          left: 70rpx;
          top: 70rpx;
        }

        .chart-box {
          position: relative;
          left: 20rpx;
          top: 20rpx;
          width: 270rpx;
          height: 270rpx;
        }
      }
    }
  }

  .get-way-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;

    image {
      width: 690rpx;
    }
  }
}
</style>
