<template>
  <uni-popup ref="addRecodePopup">
    <view class="add-recode-dialog">
      <view class="title">
        <text class="title-text">运动记录</text>
      </view>

      <view class="input-box">
        <textarea
          :value="motionText"
          @input="motionText = $event.detail.value"
          :maxlength="-1"
          placeholder="例如10个俯卧撑、5分钟平板支撑..."
        />
      </view>

      <view class="submit" @click="submit">确定</view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'addMotionRecodeDialog',

  data() {
    return {
      motionText: '',
    };
  },

  methods: {
    open() {
      this.$refs.addRecodePopup.open();
    },

    close() {
      this.$refs.addRecodePopup.close();
    },

    submit() {
      if (!this.motionText.trim()) {
        uni.showToast({
          title: '请填写记录',
          icon: 'none',
        });

        return;
      }

      this.$emit('addRecode', {
        text: this.motionText,
        type: 7,
        input_type: 1,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.add-recode-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 32rpx 20rpx 48rpx;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;

    .title-text {
      font-weight: 600;
      font-size: 28rpx;
      color: #000000;
    }
  }

  .input-box {
    flex-grow: 1;
    height: 320rpx;
    background: #f3f3f3;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    padding: 22rpx 8rpx 10rpx;
    position: relative;

    textarea {
      width: 100%;
      flex-grow: 1;
      font-size: 24rpx;
      color: #000000;
      line-height: 40rpx;
    }
  }

  .submit {
    width: 100%;
    height: 80rpx;
    background: #e8f480;
    border-radius: 60rpx;
    font-size: 28rpx;
    color: #323131;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
