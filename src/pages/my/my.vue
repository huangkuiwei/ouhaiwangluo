<template>
  <view class="my-page">
    <view class="page-title">我的</view>

    <view class="banner"></view>

    <view class="user-info">
      <view class="info">
        <view class="left" @click="goProfile">
          <image
            mode="aspectFill"
            :src="
              userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
            "
          />
        </view>

        <view class="right">
          <view class="username" v-if="isLogin" @click="goProfile">
            <text class="name">微信用户</text>
            <text class="phone">{{ userInfo.uname }}</text>
          </view>

          <view class="username" v-else>
            <text class="name" @click="$toRouter('/packageLogin/pages/login/login')">登录/注册</text>
            <text class="phone">登录/注册</text>
          </view>
        </view>
      </view>

      <view class="data-card">
        <view class="data-item">
          <text>{{ userDetailInfo.diet_count || 0 }}</text>
          <text>记录饮食/次</text>
        </view>

        <view class="data-item">
          <text>{{ userDetailInfo.movement_count || 0 }}</text>
          <text>记录运动/天</text>
        </view>
      </view>

      <view class="vip-icon" @click="goVip">
        <image
          mode="widthFix"
          :src="
            isVip
              ? 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg06.png'
              : 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg1.png'
          "
        />

        <view class="desc" v-if="isVip" :style="{ paddingTop: '26rpx' }">
          <view>你已是尊贵的会员</view>
          <view>
            <text>已解锁全部功能</text>
            <text class="time">有效期至{{ userInfo.vip_info.vip_end_time.slice(0, 10) }}</text>
          </view>
        </view>

        <view class="desc" v-else>
          <view>升级会员</view>
          <view>解锁专属健身饮食方案等所有功能</view>
        </view>
      </view>

      <view class="data">
        <view class="item" @click="previewDataPage('/pages/dietaryRecord/dietaryRecord')">
          <view class="data-title">饮食记录</view>
          <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg02.png" />
        </view>

        <view class="item" @click="previewDataPage('/pages/myRecipe/myRecipe')">
          <view class="data-title">我的食谱</view>
          <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg03.png" />
        </view>

        <view class="item" @click="previewDataPage('/pages/weightData/weightData')">
          <view class="data-title">体重数据</view>
          <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg04.png" />
        </view>

        <view class="item" @click="previewDataPage('/pages/dataStatistics/dataStatistics')">
          <view class="data-title">数据统计</view>
          <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/my/bg05.png" />
        </view>
      </view>
    </view>

    <view class="nav-container">
      <view class="nav">
        <view class="nav-item" @click="goUserCenter">
          <text class="nav-title">我的信息</text>
          <uni-icons color="#323131" type="right" size="14"></uni-icons>
        </view>

        <!-- TODO 断食提醒 -->
        <view class="nav-item">
          <text class="nav-title">断食提醒</text>
          <view>
            <text>09:00</text>
            <switch :checked="remind" @change="remind = !remind" />
          </view>
        </view>

        <view class="nav-item" @click="previewDataPage('/pages/dataReport/dataReport')">
          <text class="nav-title">数据报告</text>
          <uni-icons color="#323131" type="right" size="14"></uni-icons>
        </view>
      </view>
    </view>

    <view class="nav-container1">
      <view class="nav">
        <view class="nav-item" @click="jumpAuthPage('/pages/feedback/feedback')">
          <text class="nav-title">意见反馈</text>
          <uni-icons color="#323131" type="right" size="14"></uni-icons>
        </view>

        <view class="nav-item">
          <button class="nav-title" open-type="contact">联系客服</button>
          <uni-icons color="#323131" type="right" size="14"></uni-icons>
        </view>
      </view>
    </view>

    <custom-tab-bar />
  </view>
</template>

<script>
import { verifyIsLogin } from '@/utils';
import $http from '@/utils/http';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'myPage',

  data() {
    return {
      recodeSummary: {},
      homeWeightPlanData: null,
      remind: false,
    };
  },

  computed: {
    ...mapState('app', ['userInfo', 'userDetailInfo']),
    ...mapGetters('app', ['isLogin', 'isVip']),

    isWeightLoss() {
      if (!this.isLogin || !this.userDetailInfo) {
        return true;
      }

      return this.userDetailInfo.initial_weight - this.userDetailInfo.target_weight > 0;
    },
  },

  onShow() {
    this._getUserInfo();
    this._getUserDetailInfo();
    this.getRecodeSummary();
    this.getHomeWeightPlan();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo', '_getUserInfo']),

    /**
     * 获取首页体重相关数据
     */
    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.homeWeightPlanData = res.data;
      });
    },

    /**
     * 获取用户信息数据
     */
    getRecodeSummary() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .get(
          'api/diet-info/record-summary',
          {},
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this.recodeSummary = res.data;
        })
        .catch((err) => {
          if (err.Msg === '未找到健康档案，请先完成健康评估') {
            this.recodeSummary = {};
          } else {
            if (err.Code !== -100) {
              uni.showToast({
                title: err.Msg,
                icon: 'none',
                mask: true,
              });
            }
          }
        });
    },

    goVip() {
      if (!this.isLogin) {
        this.$toRouter('/packageLogin/pages/login/login');
        return;
      }

      this.$toRouter('/pages/vip/vip');
    },

    previewDataPage(url) {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      // if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
      //   this.$toRouter('/pages/addPlan/addPlan');
      //   return;
      // }

      this.$toRouter(url);
    },

    // 企微客服
    openContact() {
      uni.openCustomerServiceChat({
        corpId: 'wwa09afa94a53c191b',
        extInfo: {
          url: 'https://work.weixin.qq.com/kfid/kfc4d6f5ec87ef53883',
        },
      });
    },

    jumpAuthPage(url) {
      verifyIsLogin();
      this.$toRouter(url);
    },

    goProfile() {
      verifyIsLogin();
      this.$toRouter('/pages/profile/profile');
    },

    goUserCenter() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      this.$toRouter('/pages/userCenter/userCenter');
    },

    success() {
      this._getUserInfo();
      this._getUserDetailInfo();
    },
  },
};
</script>

<style>
page {
  height: 100%;
}
</style>

<style scoped lang="scss">
.my-page {
  background: linear-gradient(180deg, #e8f480cc 0%, #ffffff 100%);
  padding: 0 24rpx 200rpx;
  height: 100%;
  overflow: auto;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 60rpx;
  }

  .user-info {
    margin-bottom: 20rpx;

    .info {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;

      .left {
        margin-right: 20rpx;

        image {
          width: 100rpx;
          height: 100rpx;
          border-radius: 50%;
          display: block;
        }
      }

      .right {
        display: flex;

        .username {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16rpx;

          .name {
            font-weight: 600;
            font-size: 32rpx;
            color: #323131;
          }

          .phone {
            font-size: 28rpx;
            color: #323131;
          }
        }
      }
    }

    .data-card {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 36rpx 112rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20rpx;

        text {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 56rpx;
            color: #323131;
          }

          &:nth-child(2) {
            font-size: 24rpx;
            color: #323131;
          }
        }
      }
    }

    .vip-icon {
      width: 100%;
      position: relative;
      margin-bottom: 20rpx;

      image {
        width: 100%;
      }

      .desc {
        position: absolute;
        left: 40rpx;
        top: 20rpx;
        display: flex;
        flex-direction: column;
        gap: 24rpx;

        view {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 32rpx;
            color: #323131;
          }

          &:nth-child(2) {
            font-size: 24rpx;
            color: #323131;
            display: flex;
            align-items: center;
            gap: 34rpx;

            .time {
              font-size: 20rpx;
              color: #32313180;
            }
          }
        }
      }
    }

    .data {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item {
        position: relative;
        width: 160rpx;

        image {
          width: 100%;
        }

        .data-title {
          position: absolute;
          top: 20rpx;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 24rpx;
          color: #323131;
        }
      }
    }
  }

  .nav-container {
    border-radius: 20rpx;
    padding: 32rpx;
    border: 4rpx solid #c6b9ff;
    background: #ffffff;
    margin-bottom: 20rpx;

    .nav {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .nav-item {
        display: flex;
        align-items: center;

        .nav-title {
          font-size: 24rpx;
          color: #323131;
          flex-grow: 1;
        }

        view {
          display: flex;
          align-items: center;
          position: relative;
          left: 30rpx;

          text {
            font-size: 24rpx;
            color: #c6b9ff;
          }

          switch {
            transform: scale(0.6);
          }
        }
      }
    }
  }

  .nav-container1 {
    border-radius: 20rpx;
    padding: 32rpx;
    background: #f3f3f3;

    .nav {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .nav-item {
        display: flex;
        align-items: center;

        .nav-title {
          font-size: 24rpx;
          color: #323131;
          flex-grow: 1;
        }

        button {
          text-align: left;
          background: transparent;
          padding: 0 0 0 2rpx;
          margin: 0;

          &:after {
            border: none;
          }
        }
      }
    }
  }
}
</style>
