<template>
  <view class="evaluation-page">
    <view class="page-title">
      <text>测评</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="evaluation-container">
      <view class="evaluation-target" v-if="stepIndex === -1">
        <view class="title">你的目标是什么？</view>

        <view class="target-list">
          <view class="target-item" :class="{ active: selectTarget === 1 }" @click="selectTarget = 1">减重</view>
          <view class="target-item" :class="{ active: selectTarget === 2 }" @click="selectTarget = 2">增重</view>
          <view class="target-item" :class="{ active: selectTarget === 3 }" @click="selectTarget = 3"
            >提高健康水平</view
          >
        </view>

        <view class="next-step" @click="nextStep">下一步</view>
      </view>

      <view class="evaluation-box" v-else>
        <view class="evaluation-title">
          <text>{{ evaluationList[stepIndex].title }}</text>
          <text>{{ evaluationList[stepIndex].subTitle }}</text>
        </view>

        <view class="evaluation evaluation1" v-if="stepIndex === 0">
          <view class="gender">
            <view class="gender-item" :class="{ active: gender === 1 }" @click="gender = 1">
              <view class="gender-item-icon gender-item-icon1">
                <image
                  mode="widthFix"
                  src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/evaluation/icon01.png"
                />
              </view>

              <text>男生</text>
            </view>

            <view class="gender-item" :class="{ active: gender === 2 }" @click="gender = 2">
              <view class="gender-item-icon gender-item-icon2">
                <image
                  mode="widthFix"
                  src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/evaluation/icon02.png"
                />
              </view>

              <text>女生</text>
            </view>
          </view>

          <view>
            <view class="evaluation-title" style="margin-bottom: 60rpx">
              <text>年龄</text>
            </view>

            <picker-view :value="age">
              <picker-view-column>
                <view class="age-item" v-for="(item, index) in ageList" :key="index">{{ item }}年</view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>

        <view class="evaluation evaluation2" v-if="stepIndex === 1">
          <view class="evaluation-item">
            <view class="evaluation-item-title">身高</view>

            <view class="evaluation-item-value">
              {{ height }}
              <text class="unit">CM</text>
            </view>

            <view class="scale"></view>

            <view class="ruler-line-wrap">
              <scroll-view
                class="ruler-line"
                :scroll-into-view="initPosition1"
                :scroll-x="true"
                :enable-flex="true"
                @scroll="onScroll1"
              >
                <view
                  :id="`ruler1-${item}`"
                  class="ruler-line-item"
                  :class="{ 'int-line': item % 10 === 0 }"
                  v-for="item of rulerLineList1"
                  :key="item"
                >
                  <!-- <text v-if="item && item % 10 === 0">{{ item }}</text> -->
                </view>
              </scroll-view>
            </view>
          </view>

          <view class="evaluation-item" style="padding-bottom: 150rpx">
            <view class="evaluation-item-title" style="margin-bottom: 50rpx">体重</view>

            <view class="evaluation-item-values">
              <view class="items">
                <text>当前体重</text>
                <!-- TODO 缺少一张图片 -->
                <text>目标体重</text>
              </view>

              <view class="values">
                <view class="values-item">
                  <input type="number" v-model="initialWeight" />
                  <text>公斤</text>
                </view>

                <view class="values-item">
                  <input type="number" v-model="targetWeight" />
                  <text>公斤</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="evaluation evaluation4" v-if="stepIndex === 2">
          <view class="habit-list">
            <view
              class="habit-item"
              :class="{ active: item.active }"
              @click="onHabitChange(item)"
              v-for="item of exerciseHabits"
              :key="item.id"
            >
              <text>{{ item.text }}</text>
            </view>
          </view>
        </view>

        <view class="evaluation evaluation3" v-if="stepIndex === 3">
          <calendar
            ref="calendarRef"
            :initialWeight="initialWeight"
            :targetWeight="targetWeight"
            @selectDayChange="onSelectDayChange"
          />

          <view class="expected-wrap">
            <view class="expected" v-if="planData">
              <view class="line1">
                <view class="left">
                  预计
                  <text>{{ planData.week }}</text>
                  周
                </view>

                <view class="right">
                  每周{{ isWeightLoss ? '减重' : '增重' }}约
                  <text>{{ planData.weight }}</text>
                  公斤
                </view>
              </view>

              <view class="line2" v-if="planData.weight > 0.7">
                <text>困难模式：</text>
                <text v-if="isWeightLoss">快速减重可能会导致营养不良、肌肉流失和新陈代谢问题</text>
                <text v-else>增重速度过快，这可能会增加体内脂肪比例，对心脏和代谢健康产生不利影响。</text>
              </view>

              <view class="line2" v-else-if="planData.weight > 0.28">
                <text>适中模式：</text>
                <text>适合绝大多数人，你一也定可以的！ 加油！</text>
              </view>

              <view class="line2" v-else>
                <text>简单模式：</text>
                <text>适合绝大多数人，你一也定可以的！ 加油！</text>
              </view>
            </view>
          </view>
        </view>

        <view class="next" @click="next">{{ stepIndex > 2 ? '提交' : '下一步' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import Calendar from '@/components/calendar.vue';
import $http from '@/utils/http';

export default {
  name: 'evaluation',

  components: {
    Calendar,
  },

  data() {
    let ageList = [];

    for (let i = 1925; i < 2025; i++) {
      ageList.push(i);
    }

    let rulerLineList1 = [];
    let rulerLineList2 = [];
    let rulerLineList3 = [];

    for (let i = 0; i < 305; i++) {
      rulerLineList1.push(i);
    }

    for (let i = 0; i < 305; i++) {
      rulerLineList2.push(i);
      rulerLineList3.push(i);
    }

    return {
      evaluationList: [
        {
          title: '请选择你的性别、年龄',
          subTitle: '',
        },
        {
          title: '请选择你的身高、体重',
          subTitle: '',
        },
        {
          title: '请选择你的运动量',
          subTitle: '',
        },
        {
          title: '你期望达成的时间',
          subTitle: '',
        },
      ],
      selectTarget: 0,
      stepIndex: -1,
      gender: null,
      age: [80],
      ageList: ageList,
      height: 170,
      initialWeight: 70,
      targetWeight: 60,
      initPosition1: 'ruler1-150',
      initPosition2: 'ruler2-50',
      initPosition3: 'ruler3-40',
      rulerLineList1: rulerLineList1,
      rulerLineList2: rulerLineList2,
      rulerLineList3: rulerLineList3,
      exerciseHabits: [
        {
          id: 0,
          value: 1,
          text: '几乎不动，长时间久坐',
          active: true,
        },
        {
          id: 1,
          value: 2,
          text: '偶尔活动，每周1-3天',
          active: false,
        },
        {
          id: 2,
          value: 3,
          text: '经常活动，每周3-5天',
          active: false,
        },
        {
          id: 3,
          value: 4,
          text: '活动频繁，每周6-7天',
          active: false,
        },
        {
          id: 4,
          value: 5,
          text: '高强度活动，长时间体力工作',
          active: false,
        },
      ],
      planData: null,
    };
  },

  computed: {
    currentHabit() {
      return this.exerciseHabits.find((item) => item.active);
    },

    isWeightLoss() {
      return this.initialWeight - this.targetWeight > 0;
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
    nextStep() {
      if (!this.selectTarget) {
        uni.showToast({
          title: '请选择目标',
          icon: 'none',
        });

        return;
      }

      this.stepIndex = 0;
    },

    next() {
      if (this.stepIndex === 0) {
        if (!this.gender) {
          uni.showToast({
            title: '请选择性别',
            icon: 'none',
          });

          return;
        }
      }

      if (this.stepIndex === 2) {
        setTimeout(() => {
          let weight = Math.abs(this.initialWeight - this.targetWeight);
          this.$refs.calendarRef.currentDate = Date.now() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 0.5);

          let currentDate = new Date(this.$refs.calendarRef.currentDate);

          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
          const date = currentDate.getDate() > 9 ? currentDate.getDate() : `0${currentDate.getDate()}`;

          this.$refs.calendarRef.selectedDate = `${year}/${month}/${date}`;
        }, 0);
      }

      if (this.stepIndex === 3) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });

        $http
          .post('api/diet-info/user-info/update', {
            gender: this.gender,
            birth_year: new Date(this.ageList[this.age[0]].toString()).format(),
            height: this.height,
            initial_weight: this.initialWeight,
            target_weight: this.targetWeight,
            exercise_habits: this.currentHabit.value,
            begin_date: new Date().format(),
            end_date: new Date(this.$refs.calendarRef.selectedDate).format(),
          })
          .then(() => {
            uni.hideLoading();

            uni.showToast({
              title: '提交成功',
              icon: 'none',
              mask: true,
            });

            setTimeout(() => {
              this.$toBack();
            }, 1000);
          });

        return;
      }

      this.stepIndex += 1;
    },

    onScroll1(event) {
      this.height = Math.round((event.detail.scrollLeft / 61) * 10) + 20;
    },

    onScroll2(event) {
      this.initialWeight = Math.round((event.detail.scrollLeft / 61) * 10) + 20;
    },
    onScroll3(event) {
      this.targetWeight = Math.round((event.detail.scrollLeft / 61) * 10) + 20;
    },

    onSelectDayChange() {
      if (this.$refs.calendarRef) {
        let selectedDate = this.$refs.calendarRef.selectedDate;

        let now = Date.now();
        let selectDate = new Date(selectedDate).getTime();
        let day = Math.ceil((selectDate - now) / (1000 * 60 * 60 * 24));
        let week = day / 7;

        this.planData = {
          day,
          week: Number(week.toFixed(1)),
          weight: Number((Math.abs(this.initialWeight - this.targetWeight) / week).toFixed(2)),
        };
      }
    },

    onHabitChange(item) {
      this.exerciseHabits.forEach((x) => (x.active = false));
      item.active = true;
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  background: #ffffff;
}
</style>

<style scoped lang="scss">
.evaluation-page {
  height: 100%;
  padding-bottom: 40rpx;
  display: flex;
  flex-direction: column;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
    flex-shrink: 0;
  }

  .evaluation-container {
    padding: 60rpx 0 0;
    flex-grow: 1;
    overflow: hidden;

    .evaluation-target {
      padding: 52rpx 48rpx;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      .title {
        font-weight: 600;
        font-size: 32rpx;
        color: #000000;
      }

      .target-list {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 40rpx;

        .target-item {
          width: 100%;
          height: 80rpx;
          background: #f3f3f3;
          border-radius: 60rpx;
          font-weight: 600;
          font-size: 28rpx;
          color: #323131;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            background: #dad2ff;
          }
        }
      }

      .next-step {
        width: 100%;
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

    .evaluation-box {
      height: 100%;
      padding: 52rpx 0;
      background: #ffffff;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .evaluation-title {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 30rpx;

        text {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 32rpx;
            color: #000000;
          }

          &:nth-child(2) {
            font-size: 24rpx;
            color: #999999;
          }
        }
      }

      .evaluation {
        flex-grow: 1;
      }

      .evaluation1 {
        margin-top: 58rpx;

        .gender {
          display: flex;
          align-items: center;
          gap: 100rpx;
          margin-bottom: 100rpx;

          .gender-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 34rpx;
            position: relative;

            &.active {
              .gender-item-icon {
                background: #fcffea;
              }
            }

            .gender-item-icon {
              width: 240rpx;
              height: 280rpx;
              background: #f3f3f3;
              display: flex;
              align-items: flex-end;
              justify-content: center;
              border-radius: 10rpx;

              &.gender-item-icon2 {
                image {
                  width: 224rpx;
                }
              }

              image {
                width: 180rpx;
              }
            }

            text {
              font-weight: 600;
              font-size: 28rpx;
              color: #323131;
            }
          }
        }

        picker-view {
          height: 300rpx;

          .age-item {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30rpx;
            color: #111111;
          }
        }
      }

      .evaluation2 {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .evaluation-item {
          position: relative;

          .evaluation-item-title {
            font-weight: 600;
            font-size: 32rpx;
            color: #323131;
            text-align: center;
            padding-left: 16px;
            margin-bottom: 18rpx;
          }

          .evaluation-item-value {
            font-weight: 600;
            font-size: 36rpx;
            color: #604fa6;
            text-align: center;
            padding-left: 16px;
            padding-bottom: 20rpx;
            margin-bottom: 22rpx;

            .unit {
              color: #666666;
              font-size: 24rpx;
              margin-left: 4rpx;
            }
          }

          .scale {
            position: absolute;
            width: 2px;
            height: 49px;
            background: #604fa6;
            border-radius: 4rpx;
            top: 55px;
            left: calc(50%);
            z-index: 9;
          }

          .ruler-line-wrap {
            &:after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              height: 35px;
              background: #dad2ffaa;
            }

            .ruler-line {
              display: flex;
              width: 365px;
              margin: 0 auto;
              overflow: auto;
              height: 40px;
              position: relative;
              z-index: 9;

              .ruler-line-item {
                flex-shrink: 0;
                margin-right: 5px;
                width: 1px;
                height: 20px;
                position: relative;
                background: #808080;
                border-radius: 2rpx;

                &.int-line {
                  width: 2px;
                  height: 40px;
                  background: #595858;
                }

                &:not(.int-line) {
                  top: 20px;
                }

                text {
                  position: absolute;
                  left: 0;
                  right: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  bottom: -40rpx;
                  font-size: 22rpx;
                  color: #666666;
                }
              }
            }
          }

          .evaluation-item-values {
            .items {
              display: flex;
              align-items: center;
              justify-content: space-around;
              margin-bottom: 60rpx;

              text {
                font-weight: 600;
                font-size: 28rpx;
                color: #323131;
              }
            }

            .values {
              display: flex;
              align-items: center;
              justify-content: space-around;

              .values-item {
                display: flex;
                align-items: center;
                gap: 10rpx;

                input {
                  width: 160rpx;
                  height: 60rpx;
                  background: #d9d9d9;
                  border-radius: 20rpx;
                  font-weight: 600;
                  font-size: 32rpx;
                  color: #604fa6;
                  text-align: center;
                  position: relative;

                  &:after {
                    content: '';
                    position: absolute;
                    bottom: 8rpx;
                    left: 15rpx;
                    right: 15rpx;
                    height: 2rpx;
                    border-radius: 4rpx;
                    background: #323131;
                  }
                }

                text {
                  font-size: 28rpx;
                  color: #323131;
                }
              }
            }
          }
        }
      }

      .evaluation3 {
        padding: 0 24rpx;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .expected-wrap {
          .expected {
            background: #ffffff;
            border-radius: 25rpx;
            border: 2px solid #0abf92;
            padding: 32rpx;

            .line1 {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-weight: 500;
              font-size: 28rpx;
              color: #1a1a1a;
              margin-bottom: 40rpx;

              view {
                display: flex;
                align-items: center;

                text {
                  height: 60rpx;
                  padding: 0 16rpx;
                  background: #0abf92;
                  border-radius: 10rpx;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 42rpx;
                  color: #ffffff;
                  margin: 0 6rpx;
                }
              }
            }

            .line2 {
              color: #1a1a1a;
              font-size: 28rpx;
              line-height: 40rpx;

              text {
                &:nth-child(1) {
                  font-weight: 500;
                }
              }
            }
          }
        }
      }

      .evaluation4 {
        margin-top: 66rpx;

        .habit-list {
          display: flex;
          flex-direction: column;
          gap: 40rpx;

          .habit-item {
            width: 654rpx;
            height: 80rpx;
            background: #f3f3f3;
            border-radius: 60rpx;
            font-weight: 600;
            font-size: 28rpx;
            color: #323131;
            display: flex;
            align-items: center;
            justify-content: center;

            &.active {
              background: #dad2ff;
            }
          }
        }
      }

      .next {
        flex-shrink: 0;
        width: 654rpx;
        margin: 0 auto;
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
  }
}
</style>
