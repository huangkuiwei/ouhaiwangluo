<template>
  <custom-dialog ref="ruleDialog" title="规则">
    <view class="content">
      <view class="item">
        <view class="title">肥料获取方式</view>
        <view>1.每日签到随机获得1-5份肥料，连续签到天数越多，获得高额肥料概率越大</view>
        <view>2.每使用1份肥料可使小树长高2-5厘米</view>
      </view>

      <view class="item">
        <view class="title">生长机制</view>
        <view>1.点击肥料袋使用肥料，小树生长</view>
        <view>2.离线期间小树会自动缓慢生长，每日可能生长1-5厘米（随机触发）</view>
      </view>

      <view class="item">
        <view class="title">会员兑换标准</view>
        <view
          >小树长高至1.8米可收获兑换月度会员；小树长高至5米可收获兑换季度会员；小树长高至10米可收获兑换年度会员</view
        >
      </view>

      <view class="item">
        <view class="title">收获机制说明</view>
        <view>达到兑换高度后点击"收获"，小树将前往"阳光森林"远行</view>
        <view>收获后当前高度会减少兑换所需高度，剩余高度作为新起点继续成长，历史累计高度永久记录</view>
      </view>

      <view class="item">
        <view class="title">收获机制说明</view>
        <view>长时间不登录小树会停止生长</view>
        <view>连续签到有助于更快积累肥料，加速小树成长</view>
        <view>收获兑换后小树高度会相应减少，但成长记录会永久保存</view>
      </view>
    </view>

    <view slot="footer" class="btn" @click="close">我知道了</view>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';

export default {
  name: 'ruleDialog',

  components: {
    customDialog,
  },

  methods: {
    open() {
      this.$refs.ruleDialog.open();
    },

    close() {
      this.$refs.ruleDialog.close();
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  background: #f3f3f3;
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .item {
    font-size: 20rpx;
    color: #323131;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    view {
      line-height: 28rpx;
    }

    .title {
      font-size: 24rpx;
      text-align: center;
    }
  }
}

.btn {
  width: 100%;
  height: 60rpx;
  background: #dad2ff;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #323131;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
