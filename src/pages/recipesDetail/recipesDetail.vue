<template>
  <view class="recipes-detail">
    <view class="page-title">
      <text>{{ recipesDetail.name }}</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="cookbook-box">
      <view class="time-nav">
        <view
          class="time-item"
          :class="{ active: selectDateKey === item.key }"
          v-for="(item, index) in dateListArray"
          :key="item.key"
          @click="selectDateKey = item.key"
        >
          <text>{{ index + 1 }}</text>
          <text class="date" :class="{ active: selectDateKey === item.key }">
            {{ item.key.slice(5, 10) }}
          </text>
        </view>
      </view>

      <view class="title">
        <text>{{ recipesDetail.name_des }}</text>
        <text>食谱仅供参考</text>
        <text>{{ currentsStatisticsData.calorie }}千卡</text>
      </view>

      <view class="ingredients" v-if="recipesDetail.recipes_statistics_list">
        <view class="ingredients-item">
          <text>碳水化合物</text>
          <text
            >{{ currentsStatisticsData.carbs }}g/{{ (currentsStatisticsData.carbs_proportion * 100).toFixed(1) }}%</text
          >
        </view>

        <view class="ingredients-item">
          <text>蛋白质</text>
          <text
            >{{ currentsStatisticsData.protein }}g/{{
              (currentsStatisticsData.protein_proportion * 100).toFixed(1)
            }}%</text
          >
        </view>

        <view class="ingredients-item">
          <text>脂肪</text>
          <text>{{ currentsStatisticsData.fat }}g/{{ (currentsStatisticsData.fat_proportion * 100).toFixed(1) }}%</text>
        </view>
      </view>

      <view class="cookbook-list-wrap">
        <view class="cookbook-list">
          <view class="cookbook-item" v-for="(item, key) of dateList[selectDateKey]" :key="key">
            <view class="cookbook-title1">
              <text>{{ currentFoodData(item, key).typeName }}</text>
              <text>约{{ currentFoodData(item).currentCalorie }}千卡</text>
            </view>

            <view
              class="food-list"
              :style="{ background: key === '1' || key === '3' || key === '5' ? '#dad2ff90' : '#FCFFEA90' }"
            >
              <view class="food-item" v-for="(item1, key1) of item" :key="key1">
                <text>{{ item1.name }}</text>
                <text>{{ item1.number }}{{ item1.number_unit }}({{ item1.weight }}克)</text>
                <text>{{ item1.calorie }}千卡</text>
              </view>
            </view>
          </view>
        </view>

        <view class="tip" v-if="recipesDetail.des">{{ recipesDetail.des }}</view>

        <view
          class="options-btn"
          :class="{ closeRecipes: currentRecipesDetail.template_id === recipesDetail.id }"
          @click="useRecipes"
        >
          {{ currentRecipesDetail.template_id === recipesDetail.id ? '终止计划' : '使用食谱' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'recipesDetail',

  data() {
    return {
      id: undefined,
      recipesDetail: {},
      currentRecipesDetail: {},
      dateList: [],
      selectDateKey: undefined,
    };
  },

  onLoad(options) {
    this.id = options.id;
    this.getRecipesDetail();
    this.getCurrentRecipesDetail();
  },

  computed: {
    dateListArray() {
      return Object.keys(this.dateList).map((key) => ({
        key,
        value: this.dateList[key],
      }));
    },

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
        } else if (type === '6') {
          typeName = '晚加餐';
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

    currentsStatisticsData() {
      return (
        this.recipesDetail.recipes_statistics_list &&
        this.recipesDetail.recipes_statistics_list.find((item) => item.date === this.selectDateKey)
      );
    },
  },

  methods: {
    getCurrentRecipesDetail() {
      $http.post('api/diet-info/recipes-summarys-info').then((res) => {
        this.currentRecipesDetail = res.data;
      });
    },

    getRecipesDetail() {
      uni.showLoading({
        title: '加载中...',
      });

      $http
        .get('api/diet-info/recipes-template-info', {
          id: this.id,
        })
        .then((res) => {
          uni.hideLoading();

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
        });
    },

    useRecipes() {
      // 终止当前食谱
      if (this.currentRecipesDetail.template_id === this.recipesDetail.id) {
        uni.showModal({
          title: '确认终止食谱计划吗？',
          content: '终止后再次使用食谱需重新开始。',
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: '加载中...',
                mask: true,
              });

              $http
                .post('api/diet-info/recipes-stop', {
                  id: this.currentRecipesDetail.id,
                })
                .then(() => {
                  uni.hideLoading();
                  this.getCurrentRecipesDetail();
                });
            }
          },
        });
      }
      // 已生成免费食谱
      else if (this.currentRecipesDetail.template_id) {
        uni.showModal({
          title: '温馨提示',
          content: '您当前已经存在正在使用的食谱，是否前往食谱详情页？',
          success: (res) => {
            if (res.confirm) {
              uni.redirectTo({
                url: `/pages/recipesDetail/recipesDetail?id=${this.currentRecipesDetail.template_id}`,
              });
            }
          },
        });
      }
      // 已生成AI食谱
      else if (this.currentRecipesDetail.id && !this.currentRecipesDetail.template_id) {
        uni.showModal({
          title: '温馨提示',
          content: '您当前已经存在正在使用的食谱，是否前往食谱详情页？',
          success: (res) => {
            if (res.confirm) {
              this.$toRouter('/pages/customizedRecipes/customizedRecipes');
            }
          },
        });
      }
      // 未生成食谱
      else {
        uni.showModal({
          title: '温馨提示',
          content: '确认使用该食谱吗？',
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: '加载中...',
                mask: true,
              });

              $http.get('api/diet-info/weight-plan/last').then((res) => {
                let plan_id = res.data.plan_id;

                $http
                  .post('api/diet-info/generate-recipes-normal', {
                    id: this.recipesDetail.id,
                    plan_id: plan_id,
                  })
                  .then(() => {
                    uni.hideLoading();
                    this.getCurrentRecipesDetail();
                  });
              });
            }
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.recipes-detail {
  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 24rpx;
  }

  .cookbook-box {
    padding: 0 24rpx;

    .time-nav {
      padding: 0 12rpx;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 18rpx;
      margin-bottom: 40rpx;

      .time-item {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 20rpx 20rpx 20rpx 20rpx;
        background: #fcffea;

        &.active {
          background: #e8f480;
        }

        text {
          &:nth-child(1) {
            font-size: 28rpx;
            color: #000000;
            margin-bottom: 4rpx;
          }

          &:nth-child(2) {
            font-size: 16rpx;
            color: #333333;
          }
        }
      }
    }

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      text {
        font-weight: 600;
        color: #323131;

        &:nth-child(1) {
          font-size: 24rpx;
          margin-right: 20rpx;
        }

        &:nth-child(2) {
          flex-grow: 1;
          font-size: 20rpx;
          color: #323131cc;
        }

        &:nth-child(3) {
          font-size: 24rpx;
        }
      }
    }

    .ingredients {
      background: #ffffff;
      border-radius: 20rpx;
      border: 4rpx solid #323131;
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      margin-bottom: 20rpx;
      position: relative;
      z-index: 9;

      .ingredients-item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        text {
          font-size: 24rpx;
          color: #323131;
        }
      }
    }

    .cookbook-list-wrap {
      background: #f3f3f3;
      padding-bottom: 80rpx;
      position: relative;
      top: -30rpx;

      .cookbook-list {
        display: flex;
        flex-direction: column;
        gap: 10rpx;
        margin-bottom: 100rpx;

        .cookbook-title1 {
          padding: 26rpx 24rpx 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20rpx;

          text {
            &:nth-child(1) {
              font-weight: 600;
              font-size: 24rpx;
              color: #323131;
            }

            &:nth-child(2) {
              font-size: 20rpx;
              color: #323131cc;
            }
          }
        }

        .food-list {
          padding: 20rpx 12rpx;
          display: flex;
          flex-direction: column;
          gap: 16rpx;

          .food-item {
            display: flex;
            align-items: center;

            text {
              font-size: 24rpx;
              color: #323131;

              &:nth-child(1) {
                width: 40%;
              }

              &:nth-child(2) {
                flex-grow: 1;
              }
            }
          }
        }
      }

      .tip {
        margin-bottom: 20rpx;
        font-weight: 600;
        font-size: 20rpx;
        color: #323131dd;
        padding: 24rpx;
        line-height: 28rpx;
      }

      .options-btn {
        width: 600rpx;
        height: 80rpx;
        margin: 0 auto;
        background: #dad2ff;
        border-radius: 60rpx;
        font-size: 28rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;

        &.closeRecipes {
          background: #fcffea;
        }
      }
    }
  }
}
</style>
