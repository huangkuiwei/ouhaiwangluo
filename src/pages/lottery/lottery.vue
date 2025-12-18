<template>
  <view class="lottery-page" @click="confirmReceive">
    <view class="btn">
      <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery/point.png" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'lottery',

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    async confirmReceive() {
      uni.redirectTo({
        url: '/pages/lottery2/lottery2?draw=true',
      });
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
}
</style>

<style scoped lang="scss">
.lottery-page {
  height: 100%;
  background: #f15442 url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery/bg.png') left top/100%
    auto no-repeat;
  position: relative;

  .btn {
    position: absolute;
    top: 57%;
    left: 55%;

    @keyframes scale {
      0% {
        transform: scale(1);
      }

      50% {
        transform: scale(1.4);
      }

      100% {
        transform: scale(1);
      }
    }

    image {
      width: 139rpx;
      animation: scale 1s infinite linear;
    }
  }
}
</style>
