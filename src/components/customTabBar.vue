<template>
  <view class="custom-tab-bar">
    <view class="custom-tab-bar-wrap">
      <view
        class="custom-tab"
        :class="{ active: item.active }"
        v-for="item of tabBar"
        :key="item.text"
        @click="switchTabBar(item)"
      >
        <view class="icon-box">
          <image :src="item.iconPath" mode="aspectFill" />
        </view>

        <text>{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'customTabBar',

  data() {
    return {
      tabBar: [
        {
          pagePath: 'pages/index/index',
          text: '首页',
          iconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon1.png',
          selectedIconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon1.png',
          active: false,
        },
        {
          pagePath: 'pages/AIAssistant/AIAssistant',
          text: 'AI助理',
          iconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon2.png',
          selectedIconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon2.png',
          active: false,
        },
        {
          pagePath: 'pages/healthTree/healthTree',
          text: '健康树',
          iconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon3.png',
          selectedIconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon3.png',
          active: false,
        },
        {
          pagePath: 'pages/my/my',
          text: '我的',
          iconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon4.png',
          selectedIconPath: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/icon4.png',
          active: false,
        },
      ],
    };
  },

  mounted() {
    uni.hideTabBar();

    // eslint-disable-next-line no-undef
    const pages = getCurrentPages();

    this.tabBar.forEach((item1) => {
      item1.active = item1.pagePath === pages[pages.length - 1].route;
    });
  },

  methods: {
    /**
     * 切换 tab 页面
     * @param item
     */
    switchTabBar(item) {
      uni.switchTab({
        url: '/' + item.pagePath,
      });
    },
  },
};
</script>

<style lang="scss">
.custom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 0 0;
  box-shadow: 0 -28rpx 28rpx 0 rgba(0, 0, 0, 0.2);
  background: #ffffff;
  border-radius: 60rpx 60rpx 0 0;

  .custom-tab-bar-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .custom-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-items: center;
      width: 131rpx;
      padding: 26rpx 0 20rpx;

      &.active {
        background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/tabbar/bg.png') left top/100% 100%
          no-repeat;
      }

      .icon-box {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        image {
          height: 100%;
          width: 100%;
          margin-bottom: 4rpx;
        }
      }

      text {
        font-size: 16rpx;
        color: #222222;
      }
    }
  }
}
</style>
