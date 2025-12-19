<template>
  <view class="index-page">
    <view class="page-title">首页</view>

    <view class="banner"></view>

    <view class="progress-container">
      <view class="time">
        <text>第</text>
        <text v-if="homeWeightPlanData">{{ homeWeightPlanData.useWeek }}/{{ homeWeightPlanData.totalWeek }}</text>
        <text v-else>-/-</text>
        <text>周</text>
      </view>

      <view class="status">
        <text v-if="isLogin" @click="addPlan">
          <template v-if="homeWeightPlanData && homeWeightPlanData.state === 1">查看计划</template>
          <template v-else-if="homeWeightPlanData && homeWeightPlanData.state === 2">创建下阶段计划</template>
          <template v-else>完善个人资料</template>
        </text>
        <text v-else @click="$toRouter('/packageLogin/pages/login/login')">请登录</text>
      </view>

      <view class="chart">
        <view class="left">
          <view class="number">
            <text v-if="homeWeightPlanData">{{ homeWeightPlanData.plan_initial_weight.toFixed(2) }}</text>
            <text v-else>——</text>
            <text>公斤</text>
          </view>
          <text class="label">初始</text>
        </view>

        <view class="center">
          <view class="number">
            <template v-if="homeWeightPlanData">
              <text v-if="isWeightLoss">{{
                ((homeWeightPlanData && homeWeightPlanData.weight_loss) || 0).toFixed(2)
              }}</text>
              <text v-else>{{ ((homeWeightPlanData && -homeWeightPlanData.weight_loss) || 0).toFixed(2) }}</text>
            </template>
            <text v-else>——</text>

            <text>公斤</text>
          </view>

          <text class="label">{{ isWeightLoss ? '已减去' : '已增肌' }}</text>
        </view>

        <view class="right">
          <view class="number">
            <text v-if="homeWeightPlanData">{{ homeWeightPlanData.plan_target_weight.toFixed(2) }}</text>
            <text v-else>——</text>
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
      <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/btn-bg1.png" />

      <template v-if="isLogin">
        <text v-if="homeWeightPlanData && homeWeightPlanData.state === 1">查看我的专属方案</text>
        <text v-else-if="homeWeightPlanData && homeWeightPlanData.state === 2">制定我的专属方案</text>
        <text v-else>完善个人资料</text>
      </template>

      <text v-else>请登录</text>
    </view>

    <view class="food-list">
      <view class="food-types-wrap">
        <view class="header">
          <text class="header-title">热量计算</text>
          <view class="options">
            <view class="option-item" @click="showAddFoodRecodeDialog">
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/icon1.png" />
              <text>对话记饮食</text>
            </view>

            <view class="option-item" @click="showAddFoodRecodeDialog">
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/icon2.png" />
              <text>拍照记饮食</text>
            </view>
          </view>
        </view>

        <view class="food-types">
          <view class="food-item" v-for="item of foodRecodeList" :key="item.type" @click="selectRecodeItem = item">
            <image class="icon" mode="widthFix" :src="item.icon" />
            <text>{{ item.text }}</text>

            <view class="arrow">
              <image
                :style="{ visibility: selectRecodeItem.type === item.type ? 'visible' : 'hidden' }"
                mode="heightFix"
                src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/arrow.png"
              />
            </view>
          </view>
        </view>

        <view class="calorie-type">
          <view class="calorie-item">
            <view class="name">碳水化合物</view>

            <view class="details">
              <view class="progress" style="background: #c9c9c9">
                <text style="background: #323131" :style="{ width: dailyCalorie.remainingARatio + '%' }"></text>
              </view>
              <view class="value" v-if="dailyCalorie.carbohydrate_requirement">
                <text>{{ Math.round(dailyCalorie.carbohydrate_intake) }}/</text>
                <text>{{ Math.round(dailyCalorie.carbohydrate_requirement) }}克</text>
              </view>
              <view class="value" v-else>暂无</view>
            </view>
          </view>

          <view class="calorie-item">
            <view class="name">蛋白质</view>

            <view class="details">
              <view class="progress" style="background: #c9c9c9">
                <text style="background: #323131" :style="{ width: dailyCalorie.remainingBRatio + '%' }"></text>
              </view>
              <view class="value" v-if="dailyCalorie.protein_requirement">
                <text>{{ Math.round(dailyCalorie.protein_intake) }}/</text>
                <text>{{ Math.round(dailyCalorie.protein_requirement) }}克</text>
              </view>
              <view class="value" v-else>暂无</view>
            </view>
          </view>

          <view class="calorie-item">
            <view class="name">脂肪</view>

            <view class="details">
              <view class="progress" style="background: #c9c9c9">
                <text style="background: #323131" :style="{ width: dailyCalorie.remainingCRatio + '%' }"></text>
              </view>
              <view class="value" v-if="dailyCalorie.fat_requirement">
                <text>{{ Math.round(dailyCalorie.fat_intake) }}/</text>
                <text>{{ Math.round(dailyCalorie.fat_requirement) }}克</text>
              </view>
              <view class="value" v-else>暂无</view>
            </view>
          </view>
        </view>
      </view>

      <view class="food-list-wrap" v-if="selectRecodeItem.foodList && selectRecodeItem.foodList.length">
        <view class="food-list">
          <view
            v-for="(item, index) of selectRecodeItem.foodList"
            :key="index"
            @click="$toRouter('/pages/foodAnalysis/foodAnalysis', `type=${item.type}&time=${item.date_time}`)"
          >
            <text>{{ item.name }}</text>
            <text>{{ item.weight }}克</text>
            <text>{{ item.calorie }}千卡</text>
          </view>
        </view>

        <view class="total">今日{{ selectRecodeItem.text }}已经摄入：{{ selectRecodeItem.total }}千卡</view>
      </view>

      <view v-else class="empty-food-recode">
        <text>暂无记录，请点击上方添加记录</text>
      </view>
    </view>

    <view class="weight-cards">
      <view class="card-item" @click="updateWeight">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg3.png" />
        <view class="details details1">
          <template v-if="isLogin && userDetailInfo">
            <text>{{ userDetailInfo.current_weight }}公斤</text>
            <text v-if="updateTime === 1">今天更新</text>
            <text v-else>{{ updateTime - 1 }}天前更新</text>
          </template>

          <template v-else>
            <text>待记录</text>
            <text>无记录</text>
          </template>
        </view>
      </view>

      <!-- TODO 轻断食 -->
      <view class="card-item">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg4.png" />
        <view class="details details2">
          <text>用餐时间剩余：</text>
          <text>01:00:48</text>
        </view>
      </view>
    </view>

    <add-food-recode-dialog ref="addFoodRecodeDialog" @addRecode="addRecode" @addImageRecode="addImageRecode" />
    <custom-tab-bar />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import { verifyIsLogin } from '@/utils';
import AddFoodRecodeDialog from '@/pages/recode/addFoodRecodeDialog.vue';

let chart = null;

export default {
  name: 'indexPage',

  components: {
    AddFoodRecodeDialog,
  },

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
      foodRecodeList: [
        {
          type: 1,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type01.png',
          text: '早餐',
          foodList: [],
          total: 0,
        },
        {
          type: 3,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type02.png',
          text: '午餐',
          foodList: [],
          total: 0,
        },
        {
          type: 5,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type03.png',
          text: '晚餐',
          foodList: [],
          total: 0,
        },
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png',
          text: '早加餐',
          foodList: [],
          total: 0,
        },
        {
          type: 4,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png',
          text: '午加餐',
          foodList: [],
          total: 0,
        },
        {
          type: 6,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/food-type04.png',
          text: '晚加餐',
          foodList: [],
          total: 0,
        },
      ],
      dailyCalorie: {},
      selectRecodeItem: {},
      motionRecodeList: [],
    };
  },

  onShow() {
    this.initData();
  },

  onLoad() {
    this.selectRecodeItem = this.foodRecodeList[0];
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

    updateTime() {
      if (this.userDetailInfo) {
        let date = new Date().format().slice(0, 10);
        let day =
          new Date(date + ' 23:59:59').getTime() -
          new Date(this.userDetailInfo.weight_recode_date.replace(/-/g, '/')).getTime();
        return Math.ceil(day / (24 * 60 * 60 * 1000));
      }

      return undefined;
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

      this.getDailyCalorie();
      this.getDailyFoods();
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

    getDailyCalorie() {
      return $http
        .post(
          'api/diet-info/daily-calorie',
          {
            date: new Date().format(),
          },
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          // 卡路里总量、剩余量和比例计算
          let total = res.data.calorie_requirement + res.data.calorie_burn;
          let remaining = total - res.data.calorie_intake;
          let ratio = Number(((remaining / total) * 100).toFixed(2));

          if (ratio > 100) {
            ratio = 100;
          } else if (ratio < 0) {
            ratio = 0;
          }

          res.data.ratio = ratio;
          res.data.remaining = remaining < 0 ? 0 : Number(remaining.toFixed(2));

          // 碳水、蛋白质、脂肪剩余量和比例计算
          res.data.remainingA = Number((res.data.carbohydrate_requirement - res.data.carbohydrate_intake).toFixed(2));
          res.data.remainingB = Number((res.data.protein_requirement - res.data.protein_intake).toFixed(2));
          res.data.remainingC = Number((res.data.fat_requirement - res.data.fat_intake).toFixed(2));

          if (res.data.remainingA < 0) {
            res.data.remainingA = 0;
          }

          if (res.data.remainingB < 0) {
            res.data.remainingB = 0;
          }

          if (res.data.remainingC < 0) {
            res.data.remainingC = 0;
          }

          res.data.remainingARatio = (res.data.carbohydrate_intake / res.data.carbohydrate_requirement) * 100;
          res.data.remainingBRatio = (res.data.protein_intake / res.data.protein_requirement) * 100;
          res.data.remainingCRatio = (res.data.fat_intake / res.data.fat_requirement) * 100;

          if (res.data.remainingARatio > 100) {
            res.data.remainingARatio = 100;
          }

          if (res.data.remainingBRatio > 100) {
            res.data.remainingBRatio = 100;
          }

          if (res.data.remainingCRatio > 100) {
            res.data.remainingCRatio = 100;
          }

          this.dailyCalorie = res.data;
        })
        .catch((err) => {
          if (err.Msg === '未找到健康档案，请先完成健康评估') {
            this.dailyCalorie = {};
          } else {
            if (err.Code !== -100) {
              uni.showToast({
                title: err.Msg,
                icon: 'none',
                mask: true,
              });
            }
          }
        });
    },

    getDailyFoods() {
      return $http
        .post('api/diet-info/daily-list', {
          date: new Date().format(),
        })
        .then((res) => {
          this.foodRecodeList.forEach((item) => {
            let current = res.data.find((item1) => item1.type === item.type);
            let total = 0;

            item.foodList = (current && current.die_list) || [];

            item.foodList.forEach((item2) => {
              total += item2.calorie;
            });

            item.total = Math.round(total);
            if (item.type === this.selectRecodeItem.type) {
              this.selectRecodeItem = item;
            }
          });

          let motionItem = res.data.find((item1) => item1.type === 7);

          this.motionRecodeList = (motionItem && motionItem.die_list) || [];
        });
    },

    showAddFoodRecodeDialog() {
      if (!this.userDetailInfo) {
        verifyIsLogin();

        this.$toRouter('/pages/evaluation/evaluation');
      } else {
        this.$refs.addFoodRecodeDialog.open();
      }
    },

    addRecode(event) {
      this.$refs.addFoodRecodeDialog.close();

      this.$toRouter(
        '/pages/dietaryRecord/dietaryRecord',
        `text=${encodeURIComponent(event.text)}&type=${event.type}&input_type=${
          event.input_type
        }&date_time=${new Date().format()}`,
      );
    },

    addImageRecode(event) {
      this.$refs.addFoodRecodeDialog.close();

      this.$toRouter(
        '/pages/dietaryRecord/dietaryRecord',
        `text=&url=${encodeURIComponent(event.url)}&type=${event.type}&input_type=${
          event.input_type
        }&date_time=${new Date().format()}`,
      );
    },

    // TODO 更新体重
    updateWeight() {},

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
    position: relative;
    margin-bottom: 20rpx;

    image {
      width: 100%;
    }

    text {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 20rpx;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 28rpx;
      color: #000000;
    }
  }

  .food-list {
    border-radius: 32rpx;
    background: #323131;
    padding: 4rpx 4rpx 0;
    margin-bottom: 20rpx;

    .food-types-wrap {
      border-radius: 32rpx;
      background: #ffffff;
      padding: 18rpx 24rpx;

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 40rpx;

        .header-title {
          font-size: 24rpx;
          color: #323131;
        }

        .options {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .option-item {
            width: 220rpx;
            height: 40rpx;
            background: #dad2ff;
            border-radius: 40rpx 40rpx 40rpx 40rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4rpx;

            image {
              width: 22rpx;
              position: relative;
            }

            text {
              font-size: 16rpx;
              color: #313030;
            }
          }
        }
      }

      .food-types {
        display: flex;
        align-items: center;
        padding: 0 56rpx;
        gap: 96rpx;
        overflow: auto;
        margin-bottom: 4rpx;

        &::-webkit-scrollbar {
          display: none;
        }

        .food-item {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4rpx;

          .icon {
            width: 64rpx;
          }

          text {
            font-size: 16rpx;
            color: #323131;
          }

          .arrow {
            height: 30rpx;
            position: relative;
            top: -10rpx;

            image {
              height: 100%;
            }
          }
        }
      }

      .calorie-type {
        padding: 0 14rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .calorie-item {
          display: flex;
          flex-direction: column;
          padding: 4rpx 8rpx;
          background: #fcffea;
          gap: 8rpx;

          .name {
            font-size: 16rpx;
            color: #323131;
          }

          .details {
            display: flex;
            align-items: center;
            gap: 6rpx;

            .progress {
              width: 112rpx;
              height: 10rpx;
              border-radius: 20rpx;
              position: relative;

              text {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                border-radius: 20rpx;
              }
            }

            .value {
              font-size: 12rpx;
              color: #323131;
            }
          }
        }
      }
    }

    .food-list-wrap {
      padding: 8rpx 20rpx 14rpx;

      .food-list {
        display: flex;
        flex-direction: column;
        gap: 15rpx;
        margin-bottom: 20rpx;

        view {
          display: flex;
          align-items: center;

          text {
            &:nth-child(1) {
              font-size: 24rpx;
              color: #ffffff;
              margin-right: 6rpx;
            }

            &:nth-child(2) {
              font-size: 20rpx;
              color: #e4cfcf;
              flex-grow: 1;
            }

            &:nth-child(3) {
              font-size: 20rpx;
              color: #e4cfcf;
            }
          }
        }
      }

      .total {
        font-size: 16rpx;
        color: #ffffff;
        text-align: center;
      }
    }

    .empty-food-recode {
      font-size: 28rpx;
      color: #ffffff;
      text-align: center;
      padding: 24rpx 0;
    }
  }

  .weight-cards {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .card-item {
      width: 340rpx;
      position: relative;

      image {
        width: 100%;
      }

      .details {
        position: absolute;
        left: 104rpx;
        bottom: 22rpx;
        display: flex;
        flex-direction: column;
        color: #323131;

        &.details1 {
          text {
            &:nth-child(1) {
              font-size: 32rpx;
              margin-bottom: 6rpx;
            }

            &:nth-child(2) {
              font-size: 16rpx;
            }
          }
        }

        &.details2 {
          text {
            &:nth-child(1) {
              font-size: 16rpx;
              margin-bottom: 6rpx;
            }

            &:nth-child(2) {
              font-size: 32rpx;
            }
          }
        }
      }
    }
  }
}
</style>
