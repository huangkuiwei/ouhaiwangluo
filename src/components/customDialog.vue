<template>
  <uni-popup ref="popupRef">
    <view class="custom-dialog">
      <view class="title">
        <text>{{ title }}</text>
      </view>

      <view class="content-box">
        <slot></slot>
      </view>

      <slot name="footer"></slot>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'ruleDialog',

  props: {
    title: {
      type: String,
      default: '',
    },
  },

  methods: {
    open() {
      this.$refs.popupRef.open();
    },

    close() {
      this.$refs.popupRef.close();
    },
  },
};
</script>

<style scoped lang="scss">
.custom-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;

  .title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;

    text {
      font-weight: 600;
      font-size: 28rpx;
      color: #323131;
    }
  }

  .content-box {
    max-height: 50vh;
    overflow: auto;
  }
}
</style>
