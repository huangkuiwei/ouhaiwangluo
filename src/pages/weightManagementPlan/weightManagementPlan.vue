<template>
  <view class="weight-management-plan-page">
    <view class="page-title">
      <text>体重管理</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="plan-box">
      <view class="title">智能评估</view>

      <view class="info-list">
        <view class="info-item">
          <text>身高</text>
          <text>{{ userDetailInfo.height || 0 }}厘米</text>
        </view>

        <view class="info-item">
          <text>减重目标</text>
          <text>{{ lastPlanData.plan_initial_weight || 0 }}kg → {{ lastPlanData.plan_target_weight || 0 }}kg</text>
        </view>

        <view class="info-item">
          <text>每周</text>
          <text
            >{{
              isWeightLoss
                ? `减重${lastPlanData.weekly_loss_weight || 0}`
                : `增重${-lastPlanData.weekly_loss_weight || 0}`
            }}kg</text
          >
        </view>

        <view class="info-item">
          <text>燃脂心率</text>
          <text>{{ lastPlanData.heart_rate_min || 0 }}~{{ lastPlanData.heart_rate_max || 0 }}次/分</text>
        </view>

        <view class="info-item">
          <text>基础代谢</text>
          <text>{{ lastPlanData.plan_initial_bmr || 0 }}千卡</text>
        </view>
      </view>

      <view class="chart-box">
        <view class="chart-title"
          >目标在 <text>{{ lastPlanData.end_date && lastPlanData.end_date.slice(0, 10) }}</text> 到
          <text>{{ lastPlanData.plan_target_weight || 0 }}kg</text></view
        >

        <view class="chart">
          <l-echart ref="chartRef" @finished="init" />
        </view>

        <view class="loss-data">
          <text
            >每周{{
              isWeightLoss
                ? `减重${lastPlanData.weekly_loss_weight || 0}`
                : `增重${-lastPlanData.weekly_loss_weight || 0}`
            }}kg</text
          >
        </view>

        <view class="weight-data">
          <view class="weight-data-item">
            <text>初始BMI值为：{{ lastPlanData.plan_initial_bmi || 0 }}</text>
          </view>

          <view class="weight-data-item">
            <text>初始体重值为：{{ lastPlanData.plan_initial_weight || 0 }}KG</text>
          </view>

          <view class="weight-data-item">
            <text>当前体重值为：{{ lastPlanData.current_weight || 0 }}KG</text>
            <text class="loss-data2">
              {{ isWeightLoss ? '已减重：' : '已增重：' }}：
              <template v-if="isWeightLoss">
                {{ Number((lastPlanData.plan_initial_weight - lastPlanData.current_weight).toFixed(2)) }}KG
              </template>

              <template v-else>
                {{ -Number((lastPlanData.plan_initial_weight - lastPlanData.current_weight).toFixed(2)) }}KG
              </template>
            </text>
          </view>
        </view>

        <view class="recode-btn" @click="showUpdateTargetWeightDialog">记录体重</view>
      </view>

      <view class="options">
        <view
          class="btn change-plan"
          @click="
            $toRouter(
              '/pages/resetPlan/resetPlan',
              `plan_id=${lastPlanData.plan_id}&plan_initial_weight=${lastPlanData.plan_initial_weight}&plan_target_weight=${lastPlanData.plan_target_weight}&start_date=${lastPlanData.start_date}&end_date=${lastPlanData.end_date}`,
            )
          "
          >更改新方案</view
        >

        <view class="btns">
          <view class="btn history-plan" @click="$toRouter('/pages/historyPlan/historyPlan')">历史方案</view>
          <view class="btn delete-plan" @click="deletePlan">删除方案</view>
        </view>
      </view>

      <template v-if="isVip">
        <view class="plan-item motion-plan" v-if="exercisesPlanData.length">
          <view class="plan-detail">
            <view class="time-nav">
              <view class="time-item" v-for="(item, key) of dateList1" :key="key" @click="selectDateKey1 = key">
                <text class="date" :class="{ active: selectDateKey1 === key }">{{
                  isToday(key) ? '今日训练' : key.slice(5, 10)
                }}</text>
              </view>
            </view>

            <view class="exercises-list">
              <view class="exercises-item" v-for="item of exercisesPlanData" :key="item.id">
                <template v-if="isNotStart">
                  <view class="no-start">未开始</view>
                </template>

                <view @click.capture.stop="onCheckboxClick(item)" v-else>
                  <checkbox-group>
                    <checkbox value="1" :checked="item.is_completed.includes('1')" />
                  </checkbox-group>
                </view>

                <view class="info">
                  <text>{{ item.name }}</text>
                  <text>{{ item.content }}</text>
                  <text>{{ item.calorie }}千卡</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>

      <template v-else>
        <image
          @click="$toRouter('/pages/vip/vip')"
          mode="widthFix"
          style="width: 100%; margin-bottom: 12rpx"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/weightManagementPlan/lock01.png"
        />
      </template>

      <view class="cookbook-box">
        <view class="cookbook-title">每日食谱</view>

        <template v-if="Object.keys(dateList).length">
          <view class="time-nav">
            <view class="time-item" v-for="(item, key) of dateList" :key="key" @click="selectDateKey = key">
              <text class="date" :class="{ active: selectDateKey === key }">{{ key.slice(5, 10) }}</text>
            </view>
          </view>

          <view class="cookbook-list">
            <view class="cookbook-item" v-for="(item, key) of dateList[selectDateKey]" :key="key">
              <view class="cookbook-title1">
                <text>{{ currentFoodData(item, key).typeName }}</text>
                <text>{{ currentFoodData(item).currentCalorie }}千卡({{ currentFoodData(item).ratio }}%)</text>
              </view>

              <view class="food-list">
                <view class="food-item" v-for="(item1, key1) of item" :key="key1">
                  <text>{{ item1.name }}</text>
                  <text>{{ item1.calorie }}千卡/{{ item1.weight }}克</text>
                </view>
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="empty-food">
            <text>当前未生成食谱，是否前往生成？</text>
            <text @click="$toSwitch('/pages/AIAssistant/AIAssistant')">点击前往</text>
          </view>
        </template>
      </view>
    </view>

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

    <uni-popup ref="recipesTipDialog">
      <view class="recipes-tip-dialog">
        <view class="title">专属计划发生改变</view>
        <view class="sub-title">是否跟随专属方案<text>更改</text>食谱计划？</view>
        <view class="options">
          <text @click="keep">保留食谱原计划</text>
          <text @click="change">确定更改</text>
        </view>
      </view>
    </uni-popup>

    <add-motion-recode-dialog ref="addMotionRecodeDialog" @addRecode="addMotionRecode" />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min';
import $http from '@/utils/http';
import AddMotionRecodeDialog from '@/components/addMotionRecodeDialog.vue';

let chart = null;

export default {
  name: 'weightManagementPlan',

  components: {
    AddMotionRecodeDialog,
  },

  data() {
    let rulerLineList1 = [];

    for (let i = 0; i < 401; i++) {
      rulerLineList1.push(Number((i * 0.5).toFixed(1)));
    }

    return {
      rulerLineList1,
      lastPlanData: {},
      weighData: {},
      dateList: [],
      dateList1: {},
      selectDateKey: null,
      selectDateKey1: null,
      option: {
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          bottom: 0,
          show: false,
        },
        grid: {
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          boundaryGap: false,
          axisLabel: {
            color: '#000000',
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#000000',
          },
        },
        series: [
          {
            name: '体重',
            data: [],
            type: 'line',
            color: '#D54242',
          },
        ],
      },
      exercisesPlanData: [],
      changedTargetWeight: [0],
      recipesDetail: {},
    };
  },

  onShow() {
    this.getLastPlanData();
    this._getUserInfo();
  },

  onLoad() {
    for (let i = 0; i < 7; i++) {
      let key = new Date(Date.now() + 24 * 60 * 60 * 1000 * i).format().replace(/\//g, '-');

      this.dateList1[key] = [];

      if (i === 0) {
        this.selectDateKey1 = key;
      }
    }
  },

  computed: {
    ...mapState('app', ['userInfo', 'lifestylePlanData', 'userDetailInfo']),
    ...mapGetters('app', ['isVip']),

    currentFoodData() {
      return (foodList, type) => {
        let allCalorie = 0;

        Object.keys(this.dateList[this.selectDateKey]).forEach((key) => {
          this.dateList[this.selectDateKey][key].forEach((item) => {
            allCalorie += item.calorie;
          });
        });

        let typeName = '';
        let currentCalorie = 0;

        if (type === '1') {
          typeName = '早餐';
        } else if (type === '2') {
          typeName = '早加餐';
        } else if (type === '3') {
          typeName = '午餐';
        } else if (type === '4') {
          typeName = '午加餐';
        } else if (type === '5') {
          typeName = '晚餐';
        }

        foodList.forEach((item) => {
          currentCalorie += item.calorie;
        });

        return {
          typeName,
          currentCalorie,
          ratio: Number(((currentCalorie / allCalorie) * 100).toFixed(2)),
        };
      };
    },

    isWeightLoss() {
      return this.lastPlanData.plan_initial_weight - this.lastPlanData.plan_target_weight > 0;
    },

    isNotStart() {
      if (!this.selectDateKey1) {
        return undefined;
      }

      let time = new Date(this.selectDateKey1.replace(/-/g, '/')).getDate();
      let now = new Date().getDate();

      return time !== now;
    },

    isToday() {
      return (time) => {
        let time1 = new Date(time.replace(/-/g, '/')).getDate();
        let now = new Date().getDate();

        return time1 === now;
      };
    },
  },

  watch: {
    selectDateKey1(value) {
      this.getExercises(value);
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
    ...mapMutations('app', ['_setLifestyle']),
    ...mapActions('app', ['_getUserInfo']),

    async init() {
      chart = await this.$refs.chartRef.init(echarts);
      chart.setOption(this.option);
    },

    getCurrentRecipesDetail() {
      $http.post('api/diet-info/recipes-summarys-info').then((res) => {
        res.data.recipes_list = res.data.recipes_list || [];
        let dateList = {};

        res.data.recipes_list.forEach((item) => {
          let date = item.date;

          if (dateList[date]) {
            dateList[date].push(item);
          } else {
            dateList[date] = [item];
          }
        });

        Object.keys(dateList).forEach((dateListKey, index) => {
          let foodList = {};
          let item = dateList[dateListKey];

          item.forEach((item) => {
            let type = item.type;

            if (foodList[type]) {
              foodList[type].push(item);
            } else {
              foodList[type] = [item];
            }
          });

          if (index === 0) {
            this.selectDateKey = dateListKey;
          }

          dateList[dateListKey] = foodList;
        });

        this.dateList = dateList;
        this.recipesDetail = res.data;

        if (this.recipesDetail.id && this.recipesDetail.plan_id !== this.lastPlanData.plan_id) {
          this.$refs.recipesTipDialog.open();
        }
      });
    },

    /**
     * 获取最新一次计划数据
     */
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
          this.getRecodeWeightData(res.data.plan_id);
          this.lastPlanData = res.data;

          this.getCurrentRecipesDetail();
        })
        .catch((error) => {
          if (error.Msg === '当前没有进行中的计划,请制定新的计划') {
            uni.showToast({
              title: '计划已完成，正在返回首页',
              icon: 'none',
              mask: true,
            });

            setTimeout(() => {
              this.$toSwitch(`/pages/index/index`);
            }, 1500);
          }
        });
    },

    /**
     * 获取当前计划已记录的体重数据
     */
    getRecodeWeightData(plan_id) {
      $http
        .post('api/diet-info/weight-plan-data', {
          plan_id,
        })
        .then((res) => {
          uni.hideLoading();

          res.data.weight_list = res.data.weight_list || [];
          this.weighData = res.data;

          this.option.xAxis.data = res.data.weight_list.map((item) => item.date_time.slice(6, 10));
          this.option.series[0].data = res.data.weight_list.map((item) => item.weight);

          setTimeout(() => {
            chart.setOption(this.option);
          }, 500);
        });
    },

    /**
     * 删除计划
     */
    deletePlan() {
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
                plan_id: this.lastPlanData.plan_id,
              })
              .then(() => {
                uni.hideLoading();

                uni.showToast({
                  title: '删除成功',
                  icon: 'none',
                  mask: true,
                });

                setTimeout(() => {
                  this.$toBack();
                }, 1000);
              });
          }
        },
      });
    },

    getExercises(time) {
      $http
        .post('api/diet-info/daily-exercises', {
          date: new Date(time.replace(/-/g, '/')).format(),
        })
        .then((res) => {
          res.data.forEach((item) => {
            if (item.is_completed) {
              item.is_completed = ['1'];
            } else {
              item.is_completed = [];
            }
          });

          this.exercisesPlanData = res.data;
        });
    },

    onCheckboxClick(item) {
      if (!item.is_completed.includes('1')) {
        uni.showModal({
          title: '温馨提示',
          content: '您确定完成了此项训练吗？',
          confirmText: '完成',
          success: (res) => {
            if (res.confirm) {
              item.is_completed = ['1'];

              uni.showLoading({
                title: '加载中...',
                mask: true,
              });

              $http
                .post('api/diet-info/complete-exercise', {
                  exercise_item_id: item.id,
                })
                .then(() => {
                  uni.hideLoading();

                  uni.showToast({
                    title: '操作成功',
                    icon: 'none',
                  });

                  this.getExercises();
                });
            }
          },
        });
      }
    },

    showUpdateTargetWeightDialog() {
      let index = this.rulerLineList1.findIndex((item) => Number(item) === Number(this.lastPlanData.current_weight));

      if (index !== -1) {
        this.changedTargetWeight = [index];
      }

      this.$refs.updateTargetWeightDialog.open();
    },

    changedTargetWeightSubmit() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/user-weight/update', {
          weight: this.rulerLineList1[this.changedTargetWeight[0]],
        })
        .then(() => {
          this.$refs.updateTargetWeightDialog.close();
          uni.hideLoading();

          uni.showToast({
            title: '更新成功',
            icon: 'none',
          });

          this.getLastPlanData();
          this._getUserInfo();
        });
    },

    recode() {
      this.$refs.addMotionRecodeDialog.open();
    },

    addMotionRecode(event) {
      this.$refs.addMotionRecodeDialog.close();

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/exercise-analysis',
          {
            text: event.text,
            input_type: event.input_type,
            type: event.type,
            date_time: new Date().format(),
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          if (res.data && !res.data.length) {
            uni.hideLoading();

            uni.showModal({
              title: '温馨提示',
              content: '未检出到运动项目，请重新输入',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  this.$toBack();
                }
              },
            });

            return;
          }

          $http
            .post(
              'api/diet-info/create-batch',
              {
                food_batch: res.data,
              },
              {
                timeout: 90000,
              },
            )
            .then(() => {
              uni.hideLoading();

              uni.showToast({
                title: '添加成功',
                icon: 'none',
              });
            });
        });
    },

    keep() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/recipes-bind-weight', {
          id: this.recipesDetail.id,
          weight_plan_id: this.lastPlanData.plan_id,
        })
        .then(() => {
          this.$refs.recipesTipDialog.close();
          uni.hideLoading();

          this.getLastPlanData();
          this._getUserInfo();
        });
    },

    change() {
      this.$refs.recipesTipDialog.close();

      if (this.recipesDetail.template_id) {
        this.$toRouter('/pages/recipesDetail/recipesDetail', `id=${this.recipesDetail.template_id}`);
      } else {
        this.$toRouter('/pages/customizedRecipes/customizedRecipes');
      }
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
.weight-management-plan-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 8rpx;
  }

  .plan-box {
    padding: 0 24rpx 80rpx;
    display: flex;
    flex-direction: column;

    .title {
      width: 120rpx;
      height: 48rpx;
      background: #dad2ff;
      border-radius: 40rpx;
      font-weight: 600;
      font-size: 24rpx;
      color: #313030;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      margin-bottom: 40rpx;

      .info-item {
        height: 40rpx;
        background: #b3a1ff;
        border-radius: 40rpx;
        font-size: 24rpx;
        color: #313030;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:nth-child(1),
        &:nth-child(2) {
          background: #dad2ff;
        }
      }
    }

    .chart-box {
      padding: 14rpx 40rpx;
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/weightManagementPlan/bg.png') left
        top/100% 100% no-repeat;
      margin-bottom: 24rpx;

      .chart-title {
        font-size: 24rpx;
        color: #313030;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        text {
          color: #000000;
          padding: 0 10rpx;
        }
      }

      .chart {
        height: 420rpx;
      }

      .loss-data {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6rpx;

        text {
          padding: 8rpx;
          background: #d4e86c;
          border-radius: 40rpx;
          font-size: 20rpx;
          color: #000000;
        }
      }

      .weight-data {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        margin-bottom: 20rpx;

        .weight-data-item {
          font-size: 24rpx;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .loss-data2 {
          padding: 6rpx 12rpx;
          background: #d4e86c;
          border-radius: 40rpx;
        }
      }

      .recode-btn {
        height: 60rpx;
        background: #fcffea;
        border-radius: 40rpx;
        font-weight: 600;
        font-size: 28rpx;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .options {
      font-size: 24rpx;
      color: #313030;
      margin-bottom: 22rpx;

      .btn {
        height: 56rpx;
        border-radius: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .change-plan {
        background: #e8f480;
        margin-bottom: 20rpx;
      }

      .btns {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .history-plan {
          width: 460rpx;
          height: 40rpx;
          background: #dad2ff;
        }

        .delete-plan {
          width: 219rpx;
          height: 40rpx;
          background: #b3a1ff;
        }
      }
    }

    .plan-item {
      padding: 0 24rpx;
      margin-bottom: 24rpx;

      .plan-detail {
        background: #323131;
        border-radius: 20rpx;

        .time-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10rpx 10rpx;

          .time-item {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            color: #ffffff;

            .date {
              padding: 4rpx 6rpx;

              &.active {
                background: #ffffff;
                border-radius: 40rpx;
                font-weight: 600;
                color: #323131;
              }
            }
          }
        }

        .exercises-list {
          border: 4rpx solid #323131;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          padding: 8rpx 0;

          .exercises-item {
            display: flex;
            align-items: center;

            .no-start {
              font-size: 20rpx;
              color: #313030aa;
              padding: 14rpx;
              margin-right: 10rpx;
            }

            checkbox {
              transform: scale(0.6);
            }

            .info {
              font-size: 20rpx;
              color: #313030;
              flex-grow: 1;
              display: flex;
              align-items: center;
              gap: 8rpx;
            }
          }
        }
      }
    }

    .cookbook-box {
      padding: 22rpx 20rpx;
      background: #dad2ff;
      border-radius: 20rpx;

      .cookbook-title {
        font-weight: 600;
        font-size: 24rpx;
        color: #313030;
        margin-bottom: 14rpx;
      }

      .time-nav {
        display: flex;
        align-items: center;
        overflow: auto;
        margin-bottom: 18rpx;

        .time-item {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .date {
            font-size: 24rpx;
            color: #313030;
            padding: 8rpx 12rpx;

            &.active {
              background: #ffffff;
              border-radius: 40rpx;
            }
          }
        }
      }

      .cookbook-list {
        padding: 0 14rpx;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .cookbook-item {
          background: #b3a1ff;
          border-radius: 20rpx;
          padding: 12rpx;

          .cookbook-title1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8rpx;

            text {
              font-size: 20rpx;
              color: #323131;
            }
          }

          .food-list {
            display: flex;
            flex-direction: column;
            gap: 8rpx;

            .food-item {
              display: flex;
              align-items: center;
              justify-content: space-between;

              text {
                font-size: 20rpx;
                color: #323131;
              }
            }
          }
        }
      }

      .empty-food {
        padding: 60rpx 0;
        font-size: 24rpx;
        color: #323131cc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20rpx;

        text {
          &:nth-child(2) {
            color: #323131;
          }
        }
      }
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

.recipes-tip-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 60rpx 52rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .title {
    font-size: 32rpx;
    color: #000000;
    margin-bottom: 110rpx;
  }

  .sub-title {
    font-weight: 500;
    font-size: 28rpx;
    color: #000000;
    margin-bottom: 114rpx;

    text {
      color: #604fa6;
    }
  }

  .options {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;

    text {
      width: 280rpx;
      height: 80rpx;
      background: #e8f480;
      border-radius: 60rpx;
      font-size: 28rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;

      &:nth-child(2) {
        background: #fcffea;
      }
    }
  }
}
</style>
