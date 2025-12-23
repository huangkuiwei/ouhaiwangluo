<template>
  <uni-popup ref="updateEndDateDialog" type="bottom" :safe-area="false">
    <view class="update-end-date-dialog">
      <view class="title" style="text-align: center" v-if="editPlan">
        <text class="pre-step" @click="$emit('preStep')">上一步</text>
        <text>选择新的目标体重</text>
      </view>

      <view class="title" v-else>选择你的目标日期</view>

      <view class="list">
        <picker-view
          indicator-style="height: 40px;"
          style="width: 100%; height: 200px"
          :value="value"
          @change="onPickerChange"
        >
          <!-- 年 -->
          <picker-view-column>
            <view
              class="item"
              :class="{
                active: value[0] === index1,
              }"
              v-for="(year, index1) in years1"
              :key="year"
            >
              <text class="value">{{ year }}</text>
              <text class="unit" v-if="value[0] === index1">年</text>
            </view>
          </picker-view-column>

          <!-- 月 -->
          <picker-view-column>
            <view
              class="item"
              :class="{
                active: value[1] === index2,
              }"
              v-for="(month, index2) in months1"
              :key="month"
            >
              <text class="value">{{ month }}</text>
              <text class="unit" v-if="value[1] === index2">月</text>
            </view>
          </picker-view-column>

          <!-- 日 -->
          <picker-view-column>
            <view
              class="item"
              :class="{
                active: value[2] === index3,
              }"
              v-for="(day, index3) in days1"
              :key="day"
            >
              <text class="value">{{ day }}</text>
              <text class="unit" v-if="value[2] === index3">日</text>
            </view>
          </picker-view-column>
        </picker-view>
      </view>

      <view class="options">
        <text @click="submit" v-if="editPlan">调整</text>
        <text @click="submit" v-else>确定</text>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'updateEndDateDialog',

  data() {
    return {
      localUserDetailInfo: {},
      initialWeight: 0,
      targetWeight: 0,

      dateMap: new Map(),
      years1: [],
      months1: [],
      days1: [],
      value: [0, 0, 0],
      minDateStr: '',
      selectedDate: '',
    };
  },

  props: {
    userDetailInfo: {
      type: Object,
      default: () => ({}),
    },

    editPlan: {
      type: Boolean,
      default: false,
    },
  },

  watch: {
    minDateStr(value) {
      const minDate = new Date(value);

      if (isNaN(minDate)) {
        throw new Error('最小日期格式无效，请使用 yyyy-MM-dd');
      }

      minDate.setHours(0, 0, 0, 0);

      // 生成从 minDate 开始，到未来几年内的所有合法日期（比如到 2026 年）
      const validDates = this.generateValidDateRange(value, 2026);

      // 构建层级映射：year → month → day（字符串）
      const dateMap = new Map();
      const yearSet = new Set();

      validDates.forEach((d) => {
        const y = String(d.year);
        const m = d.month < 10 ? `0${d.month}` : `${d.month}`;
        const dd = d.day < 10 ? `0${d.day}` : `${d.day}`;

        yearSet.add(y);
        if (!dateMap.has(y)) dateMap.set(y, new Map());
        if (!dateMap.get(y).has(m)) dateMap.get(y).set(m, new Set());
        dateMap.get(y).get(m).add(dd);
      });

      this.dateMap = dateMap;

      // 初始化选项
      this.years1 = Array.from(yearSet).sort((a, b) => a - b);
      this.months1 = dateMap.has(this.years1[0]) ? Array.from(dateMap.get(this.years1[0]).keys()).sort() : [];
      this.days1 = this.months1.length > 0 ? Array.from(dateMap.get(this.years1[0]).get(this.months1[0])).sort() : [];
    },
  },

  methods: {
    open() {
      this.localUserDetailInfo = JSON.parse(JSON.stringify(this.userDetailInfo));
      // 以最新体重和当前时间作为目标的初始体重和日期进行计算
      this.initialWeight = this.localUserDetailInfo.current_weight / 2;
      this.targetWeight = this.localUserDetailInfo.target_weight / 2;
      this.beginDate = new Date(this.localUserDetailInfo.begin_date.replace(/-/g, '/'));
      this.endDate = new Date(this.localUserDetailInfo.end_date.replace(/-/g, '/'));

      setTimeout(() => {
        let weight = Math.abs(this.initialWeight - this.targetWeight);
        // 默认显示用户设置的结束时间
        // let time = this.endDate.getTime();
        // let time1 = this.beginDate.getTime() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 1);
        let time = Date.now() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 0.5);
        let time1 = Date.now() + 7 * 24 * 60 * 60 * 1000 * Math.ceil(weight / 1);

        let currentDate = new Date(time);
        let currentDate1 = new Date(time1);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
        const date = currentDate.getDate() > 9 ? currentDate.getDate() : `0${currentDate.getDate()}`;

        const year1 = currentDate1.getFullYear();
        const month1 =
          currentDate1.getMonth() + 1 > 9 ? currentDate1.getMonth() + 1 : `0${currentDate1.getMonth() + 1}`;
        const date1 = currentDate1.getDate() > 9 ? currentDate1.getDate() : `0${currentDate1.getDate()}`;

        this.minDateStr = `${year1}/${month1}/${date1}`;

        setTimeout(() => {
          let index1 = this.years1.findIndex((item) => Number(item) === Number(year));
          this.value = [index1, 0, 0];

          this.onPickerChange({
            detail: {
              value: this.value,
            },
          });

          setTimeout(() => {
            let index2 = this.months1.findIndex((item) => Number(item) === Number(month));
            this.value = [index1, index2, 0];

            this.onPickerChange({
              detail: {
                value: this.value,
              },
            });

            setTimeout(() => {
              let index3 = this.days1.findIndex((item) => Number(item) === Number(date));
              this.value = [index1, index2, index3];

              this.onPickerChange({
                detail: {
                  value: this.value,
                },
              });
            }, 0);
          }, 0);
        });
      }, 0);

      this.$refs.updateEndDateDialog.open();
    },

    close() {
      this.$refs.updateEndDateDialog.close();
    },

    // 生成从 minDate 到 maxYear 年末的所有合法日期
    generateValidDateRange(minDate, maxYear = 2026) {
      const result = [];
      let currentDate = new Date(minDate);

      while (currentDate.getFullYear() <= maxYear) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        result.push({ year, month, day });

        // 下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },

    // 滚动选择时触发
    onPickerChange(e) {
      const [yIdx, mIdx, dIdx] = e.detail.value;
      const selectedYear = this.years1[yIdx];
      const selectedMonth = this.months1[mIdx];

      // 获取该年月下的可选日期
      const daySet = this.dateMap.get(selectedYear)?.get(selectedMonth);
      let validDays = [];

      if (daySet) {
        validDays = Array.from(daySet).sort();
      } else {
        let monthList = Array.from(this.dateMap.get(selectedYear).keys()).sort();
        let daySet1 = this.dateMap.get(selectedYear)?.get(monthList[0]);
        validDays = Array.from(daySet1).sort();
      }

      // 修正日索引（防止越界）
      let newDayIdx = dIdx;
      if (dIdx >= validDays.length) {
        newDayIdx = 0;
      }
      const selectedDay = validDays[newDayIdx];

      // 更新 data
      this.months1 = Array.from(this.dateMap.get(selectedYear)?.keys() || []).sort();
      this.days1 = validDays;

      // 修正月份（如果原月份不在新列表中）
      const actualMonth = this.months1.includes(selectedMonth) ? selectedMonth : this.months1[0];
      const actualDay = validDays.includes(selectedDay) ? selectedDay : validDays[0];

      // 修正 value
      setTimeout(() => {
        this.value = [yIdx, this.months1.indexOf(actualMonth), validDays.indexOf(actualDay)];
      }, 0);

      // 更新显示
      this.selectedDate = `${selectedYear}/${actualMonth}/${actualDay}`;
    },

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    },

    async submit() {
      Object.assign(this.localUserDetailInfo, {
        end_date: this.selectedDate,
      });

      this.$emit('submit', this.localUserDetailInfo);
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.update-end-date-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx 30rpx 50rpx;

  .title {
    font-weight: 500;
    font-size: 28rpx;
    color: #111111;
    position: relative;
    margin-bottom: 63rpx;

    .pre-step {
      position: absolute;
      left: 20rpx;
      top: 0;
      font-weight: 500;
      font-size: 26rpx;
      color: #65d285;
    }
  }

  .list {
    margin-bottom: 44rpx;

    picker-view {
      margin-bottom: 52rpx;

      picker-view-column {
        .item {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            .value {
              font-weight: bold;
              font-size: 38rpx;
              color: #65d285;
            }

            .unit {
              color: #65d285;
            }
          }

          .value {
            font-weight: 500;
            font-size: 28rpx;
            color: #999999;
          }

          .unit {
            font-weight: 500;
            font-size: 24rpx;
            color: #999999;
            margin-left: 15rpx;
            position: relative;
            top: 4rpx;
          }
        }
      }
    }
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      width: 550rpx;
      height: 100rpx;
      background: #65d285;
      border-radius: 50rpx;
      font-weight: bold;
      font-size: 30rpx;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
