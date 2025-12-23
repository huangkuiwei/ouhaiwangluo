<template>
  <uni-popup ref="updateHabitsDialog" type="bottom" :safe-area="false">
    <view class="update-habits-dialog">
      <view class="title">运动量</view>

      <view class="exercise-habits-list">
        <text
          :class="{ active: localUserDetailInfo.exercise_habits === index }"
          v-for="(item, index) of list"
          :key="item.value"
          @click="localUserDetailInfo.exercise_habits = index"
        >
          {{ item.text }}
        </text>
      </view>

      <view class="options">
        <text @click="submit">保存</text>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'updateHabitsDialog',

  data() {
    return {
      localUserDetailInfo: {},
    };
  },

  props: {
    list: {
      type: Array,
      default: () => [],
    },

    userDetailInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  methods: {
    open() {
      this.localUserDetailInfo = JSON.parse(JSON.stringify(this.userDetailInfo));
      this.$refs.updateHabitsDialog.open();
    },

    close() {
      this.$refs.updateHabitsDialog.close();
    },

    submit() {
      this.$emit('submit', this.localUserDetailInfo);
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.update-habits-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 30rpx 48rpx 48rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 56rpx;
  }

  .exercise-habits-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    margin-bottom: 36rpx;

    text {
      width: 560rpx;
      height: 48rpx;
      border-radius: 60rpx;
      font-size: 28rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;

      &.active {
        background: #dbd3ff;
      }
    }
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    text {
      width: 200rpx;
      height: 60rpx;
      background: #e8f480;
      border-radius: 60rpx;
      font-size: 24rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
