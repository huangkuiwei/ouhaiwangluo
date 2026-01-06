<template>
  <view class="login-page">
    <view class="page-title">
      <text></text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"> </view>

    <view class="no-login" @click="$toSwitch('/pages/index/index')">暂不登录</view>

    <view class="container">
      <view class="title">OUHI欢迎你的到来</view>

      <view class="input-box">
        <text>{{ phone.slice(0, 3) }}****{{ phone.slice(-4) }}</text>
      </view>

      <view class="other-login" @click="$toBack">其他手机号码登录</view>
      <view class="login" @click="login">一键登录</view>

      <view class="agreement">
        <checkbox-group @change="agree = $event.detail.value">
          <label>
            <checkbox color="#E8F480" value="1" :checked="agree.includes('1')" />
          </label>
        </checkbox-group>
        <view>
          我已阅读并同意
          <text @click="$toRouter('/packageLogin/pages/protocol/protocol')">《用户协议》</text>
          和
          <text @click="$toRouter('/packageLogin/pages/privacy/privacy')">《隐私政策》</text>
        </view>
      </view>
    </view>

    <view class="kefu">
      <text @click="callPhone">联系客服</text>
      <text class="line">｜</text>
      <text>客服电话：020-89631980</text>
    </view>
  </view>
</template>

<script>
import $http from '@/utils/http';
import { mapActions } from 'vuex';

export default {
  name: 'login',

  data() {
    return {
      agree: [],
      phone: '',
      token: '',
    };
  },

  onLoad(options) {
    this.phone = options.phone;
    this.token = options.token;
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserInfo']),

    /**
     * 登录
     */
    login() {
      if (!this.agree.includes('1')) {
        uni.showToast({
          title: '请阅读并同意《用户协议》和《隐私政策》',
          icon: 'none',
        });

        return;
      }

      // 登录完成之后保存 token
      const storageExpireDays = 7;
      const currentTime = Date.now();
      const expireTime = currentTime + storageExpireDays * 24 * 60 * 60 * 1000; // 当前时间加上7天
      uni.setStorageSync('foodDiaryToken', {
        value: this.token,
        expireTime: expireTime,
      });

      // 后端更新open_id和unionid
      uni.login({
        success: (res) => {
          $http.post('api/user/auth/userauth/get_openid', {
            code: res.code,
            micro_appid: uni.getAccountInfoSync().miniProgram.appId,
          });
        },
      });

      // 登录完成获取用户信息
      this._getUserInfo().then(() => {
        uni.hideLoading();

        uni.showToast({
          title: '登录成功',
          icon: 'none',
          mask: true,
        });

        uni.switchTab({
          url: '/pages/index/index',
        });
      });
    },

    callPhone() {
      uni.makePhoneCall({
        phoneNumber: '020-89631980',
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
.login-page {
  height: 100%;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/login/bg.png') top left/100% 100% no-repeat;
  padding-bottom: 60rpx;
  display: flex;
  flex-direction: column;

  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 0;
  }

  .no-login {
    padding: 20rpx 40rpx 0;
    font-size: 32rpx;
    color: #313030;
    text-align: right;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 40rpx;
      width: 128rpx;
      height: 2rpx;
      background: #313030;
    }
  }

  .container {
    flex-grow: 1;
    padding-bottom: 210rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .title {
      font-weight: 600;
      font-size: 40rpx;
      color: #313030;
      margin-bottom: 216rpx;
    }

    .input-box {
      font-weight: 600;
      font-size: 56rpx;
      color: #323131;
      margin-bottom: 60rpx;
    }

    .other-login {
      font-size: 24rpx;
      color: #313030;
      position: relative;
      padding: 8rpx;
      margin-bottom: 24rpx;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 204rpx;
        height: 2rpx;
        background: #313030;
      }
    }

    .login {
      width: 532rpx;
      height: 100rpx;
      background: linear-gradient(86deg, #e8f480 0%, #fcffea 100%);
      border-radius: 60rpx;
      font-size: 28rpx;
      color: #313030;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
    }

    .agreement {
      display: flex;
      align-items: center;

      checkbox {
        transform: scale(0.55);
      }

      view {
        font-size: 20rpx;
        color: #5a5959;
      }
    }
  }

  .kefu {
    font-size: 20rpx;
    color: #5a5959aa;
    align-self: center;

    .line {
      padding: 0 12rpx;
    }
  }
}
</style>
