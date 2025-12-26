<template>
  <view class="calendar-com">
    <!-- 年月标题与切换按钮 -->
    <view class="calendar-header">
      <view class="toggle">
        <uni-icons @click="prevMonth" color="#000000" type="left" size="16"></uni-icons>
        <text class="time">{{ currentMonth }}</text>
        <uni-icons @click="nextMonth" color="#000000" type="right" size="16"></uni-icons>
      </view>

      <image
        @click="showCalendar = !showCalendar"
        class="toggle-calendar"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/recode/calendar-icon.png"
      />
    </view>

    <view class="calendar-wrapper" v-show="showCalendar">
      <!-- 星期行 -->
      <view class="calendar-weekdays">
        <view v-for="day in weekDays" :key="day" class="weekday">{{ day }}</view>
      </view>

      <!-- 日期展示 -->
      <view class="calendar-days">
        <view
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            disabled: day.disabled,
            selected: day.selected,
            today: day.isToday,
          }"
          @click="selectDay(day)"
        >
          <view>
            <text>{{ day.value }}</text>
            <text>{{ day.value && lunarByDate(day.dateStr) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import solarlunar from 'solarlunar';
import { verifyIsLogin } from '@/utils';

export default {
  name: 'calendar',

  props: {
    initialWeight: {
      type: Number,
    },

    targetWeight: {
      type: Number,
    },
  },

  data() {
    return {
      currentDate: new Date().getTime(), // 当前显示月份的时间戳
      selectedDate: null, // 选中日期的时间戳
      minSelectableDate: null, // 最小可选日期（明天）
      weekDays: ['一', '二', '三', '四', '五', '六', '日'],
      showCalendar: true,
    };
  },

  mounted() {
    let date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    this.selectedDate = `${year}/${month + 1 > 9 ? month + 1 : `0${month + 1}`}/${day > 9 ? day : `0${day}`}`;
  },

  computed: {
    lunarByDate() {
      return (dateStr) => {
        let date = new Date(dateStr);
        return solarlunar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate()).dayCn;
      };
    },

    currentMonth() {
      const date = new Date(this.currentDate);
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    },

    calendarDays() {
      const date = new Date(this.currentDate);
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDay = new Date(year, month, 1); // 本月第一天
      const lastDay = new Date(year, month + 1, 0); // 本月最后一天
      const totalDays = lastDay.getDate(); // 总天数
      const startDay = firstDay.getDay(); // 第一天是星期几（0=周日）

      const days = [];
      const today = new Date(); // 当前时间
      const minDate = this.minSelectableDate;

      // 补齐前面空白的格子（周一为第一列）
      const offset = (startDay + 6) % 7; // 调整成周一为第一天
      for (let i = 0; i < offset; i++) {
        days.push({ value: '', disabled: true });
      }

      // 添加当月的每一天
      for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}/${month + 1 > 9 ? month + 1 : `0${month + 1}`}/${day > 9 ? day : `0${day}`}`;
        const currDate = new Date(year, month, day).getTime();
        const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
        const isSelected = this.selectedDate && dateStr === this.selectedDate;
        let isDisabled = currDate > minDate;

        days.push({
          dateStr,
          value: day,
          date: currDate,
          isToday,
          disabled: isDisabled,
          selected: isSelected,
        });
      }

      // 补齐最后一行（最多补6个空格）
      const totalCells = offset + totalDays;
      const fillCount = (7 - (totalCells % 7)) % 7;
      for (let i = 0; i < fillCount; i++) {
        days.push({ value: '', disabled: true });
      }

      return days;
    },
  },

  watch: {
    selectedDate(value) {
      this.$emit('selectDayChange', value);
    },
  },

  created() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    this.minSelectableDate = tomorrow.getTime();
  },

  methods: {
    prevMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() - 1);
      this.currentDate = date.getTime();
    },

    nextMonth() {
      const date = new Date(this.currentDate);
      date.setMonth(date.getMonth() + 1);
      this.currentDate = date.getTime();
    },

    selectDay(day) {
      if (!day || day.disabled || !day.value) return;
      verifyIsLogin();
      this.selectedDate = day.dateStr;
    },
  },
};
</script>

<style scoped lang="scss">
.calendar-com {
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 36rpx;
    position: relative;

    .time {
      width: 180rpx;
      text-align: center;
      font-weight: 500;
      font-size: 25rpx;
      color: #000000;
    }

    .toggle {
      display: flex;
      align-items: center;
    }

    .toggle-calendar {
      position: absolute;
      top: 0;
      right: 40rpx;
      width: 35rpx;
    }
  }

  .calendar-wrapper {
    transition: all 0.3s;

    .calendar-weekdays {
      display: flex;
      justify-content: space-between;
      text-align: center;
      margin-bottom: 26rpx;

      .weekday {
        font-size: 24rpx;
        color: #000000;
        flex-grow: 1;
        text-align: center;
      }
    }

    .calendar-days {
      display: flex;
      flex-wrap: wrap;

      .calendar-day {
        width: calc(100% / 7);
        padding: 2rpx 0;
        cursor: pointer;
        font-size: 24rpx;
        color: #333333;
        display: flex;
        align-items: center;
        justify-content: center;

        view {
        }

        &.selected {
          color: #ffffff;

          view {
            background: #35d16e;
          }
        }

        &.disabled {
          view {
            color: #aaaaaa;
          }
        }

        view {
          width: 68rpx;
          height: 68rpx;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4rpx;

          text {
            &:nth-child(1) {
              font-size: 24rpx;
            }

            &:nth-child(2) {
              font-size: 19rpx;
            }
          }
        }
      }
    }
  }
}
</style>
