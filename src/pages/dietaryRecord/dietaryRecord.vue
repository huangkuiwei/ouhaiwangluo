<template>
  <view class="dietary-record">
    <view class="page-title">
      <text>饮食记录</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>
  </view>
</template>

<script>
export default {
  name: 'dietaryRecord',
};
</script>

<style>
page {
  background: #ffffff url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/dataReport/bg01.png') left top/100%
    auto no-repeat;
}
</style>

<style scoped lang="scss">
.dietary-record {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 42rpx;
  }
}
</style>
