<template>
  <view class="calendar-com">
    <view class="month" @click="$refs.selectMonthDialog.open()">
      <text class="time">{{ currentMonth }}</text>
      <text class="icon"></text>
    </view>

    <view class="line"></view>

    <scroll-view
      :scroll-x="true"
      :scroll-into-view="scrollDay"
      :enable-flex="true"
      :show-scrollbar="false"
      class="calendar-days"
    >
      <!-- 日期展示 -->
      <view
        v-for="day in calendarDays"
        :key="day.date"
        class="calendar-day"
        :id="`days-${day.value}`"
        :class="{
          disabled: day.disabled,
          selected: day.selected,
          today: day.isToday,
        }"
        :style="{ top: platform === 'ios' || platform === 'devtools' ? '18rpx' : '' }"
        @click="selectDay(day)"
      >
        {{ day.value }}
      </view>
    </scroll-view>

    <select-month-dialog ref="selectMonthDialog" :selectedDate="selectedDate" @submit="selectMonthSubmit" />
  </view>
</template>

<script>
import { verifyIsLogin } from '@/utils';
import SelectMonthDialog from '@/components/selectMonthDialog.vue';

export default {
  name: 'calendar2',

  components: {
    SelectMonthDialog,
  },

  props: {
    initialWeight: {
      type: Number,
    },

    targetWeight: {
      type: Number,
    },
  },

  data() {
    const platform = uni.getDeviceInfo().platform;

    return {
      platform,
      currentDate: new Date().getTime(), // 当前显示月份的时间戳
      selectedDate: null, // 选中日期的时间戳
      minSelectableDate: null, // 最小可选日期（明天）
      weekDays: ['一', '二', '三', '四', '五', '六', '日'],
      showCalendar: true,
      scrollDay: undefined,
    };
  },

  mounted() {
    let date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    this.selectedDate = `${year}/${month + 1 > 9 ? month + 1 : `0${month + 1}`}/${day > 9 ? day : `0${day}`}`;
    this.scrollDay = `days-${day > 9 ? day : `0${day}`}`;
  },

  computed: {
    currentMonth() {
      const date = new Date(this.currentDate);
      return `${date.getMonth() + 1}月`;
    },

    calendarDays() {
      const date = new Date(this.currentDate);
      const year = date.getFullYear();
      const month = date.getMonth();

      // const firstDay = new Date(year, month, 1); // 本月第一天
      const lastDay = new Date(year, month + 1, 0); // 本月最后一天
      const totalDays = lastDay.getDate(); // 总天数
      // const startDay = firstDay.getDay(); // 第一天是星期几（0=周日）

      const days = [];
      const today = new Date(); // 当前时间
      const minDate = this.minSelectableDate;

      // 补齐前面空白的格子（周一为第一列）
      // const offset = (startDay + 6) % 7; // 调整成周一为第一天
      // for (let i = 0; i < offset; i++) {
      //   days.push({ value: '', disabled: true });
      // }

      // 添加当月的每一天
      for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}/${month + 1 > 9 ? month + 1 : `0${month + 1}`}/${day > 9 ? day : `0${day}`}`;
        const currDate = new Date(year, month, day).getTime();
        const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
        const isSelected = this.selectedDate && dateStr === this.selectedDate;
        let isDisabled = currDate > minDate;

        days.push({
          dateStr,
          value: day > 9 ? day : `0${day}`,
          date: currDate,
          isToday,
          disabled: isDisabled,
          selected: isSelected,
        });
      }

      // 补齐最后一行（最多补6个空格）
      // const totalCells = offset + totalDays;
      // const fillCount = (7 - (totalCells % 7)) % 7;
      // for (let i = 0; i < fillCount; i++) {
      //   days.push({ value: '', disabled: true });
      // }

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

    selectMonthSubmit(event) {
      this.currentDate = new Date(event + '/01').getTime();

      this.scrollDay = `days-99`;

      setTimeout(() => {
        this.scrollDay = `days-01`;
        this.selectedDate = event + '/01';
      });
    },
  },
};
</script>

<style scoped lang="scss">
.calendar-com {
  display: flex;
  align-items: center;

  .month {
    flex-shrink: 0;
    width: 110rpx;
    height: 40rpx;
    background: #b3a1ff;
    border-radius: 20rpx;
    margin-right: 24rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
    justify-content: center;

    .time {
      font-size: 28rpx;
      color: #323131;
    }

    .icon {
      border-top: 10rpx solid #323131;
      border-bottom: 10rpx solid transparent;
      border-right: 10rpx solid transparent;
      border-left: 10rpx solid transparent;
      position: relative;
      top: 6rpx;
    }
  }

  .line {
    flex-shrink: 0;
    width: 2rpx;
    height: 30rpx;
    background: #6b6b6b50;
    margin-right: 6rpx;
  }

  .calendar-days {
    width: 580rpx;
    height: 60rpx;
    display: flex;
    align-items: center;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      color: transparent;
    }

    &::-webkit-scrollbar-track {
      display: none;
    }

    &::-webkit-scrollbar-thumb {
      display: none;
    }

    .calendar-day {
      flex-shrink: 0;
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      font-size: 28rpx;
      color: #323131;
      position: relative;
      top: 20rpx;
      margin-right: 26rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &.selected {
        background: #ffffff;
      }

      &.disabled {
        color: #32313180;
      }
    }
  }
}
</style>
