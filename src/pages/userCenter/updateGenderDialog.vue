<template>
  <uni-popup ref="updateGenderDialog" type="bottom" :safe-area="false">
    <view class="update-gender-dialog">
      <view class="title">性别</view>

      <view class="gender-list">
        <text
          :class="{ active: localUserDetailInfo.gender === index }"
          v-for="(item, index) of genderList"
          :key="item.value"
          @click="localUserDetailInfo.gender = index"
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
  name: 'updateGenderDialog',

  data() {
    return {
      localUserDetailInfo: {},
    };
  },

  props: {
    genderList: {
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
      this.$refs.updateGenderDialog.open();
    },

    close() {
      this.$refs.updateGenderDialog.close();
    },

    submit() {
      this.$emit('submit', this.localUserDetailInfo);
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.update-gender-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 30rpx 48rpx 48rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 76rpx;
  }

  .gender-list {
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
