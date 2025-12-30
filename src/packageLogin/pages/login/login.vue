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
        <view class="phone">
          <input
            type="text"
            placeholder="请输入手机号"
            :value="formState.mobile"
            @input="formState.mobile = $event.detail.value"
          />
        </view>

        <view class="password">
          <input
            type="number"
            :maxlength="6"
            placeholder="请输入验证码"
            :value="formState.sms_code"
            @input="formState.sms_code = $event.detail.value"
          />
          <text class="line"></text>
          <text class="get-code" @click="sendCode">{{ codeTip }}</text>
        </view>
      </view>

      <view class="login" @click="login">登录</view>
      <button open-type="getPhoneNumber" class="login" @getphonenumber="oneKeyLogin">本机号码一键登录</button>

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
      formState: {
        mobile: '',
        sms_sign: '',
        sms_code: '',
      },
      countdown: '',
      agree: [],
    };
  },

  watch: {
    countdown(value) {
      setTimeout(() => {
        if (value > 0) {
          let countdown = this.countdown - 1;

          if (countdown < 0) {
            this.countdown = 0;
          } else {
            this.countdown--;
          }
        }
      }, 1000);
    },
  },

  computed: {
    disabled() {
      return !!this.countdown;
    },

    codeTip() {
      if (this.countdown) {
        return `${this.countdown}S重新获取`;
      } else {
        return '获取验证码';
      }
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserInfo']),

    /**
     * 发送验证码
     */
    sendCode() {
      if (this.disabled) return;

      if (!this.agree.includes('1')) {
        uni.showToast({
          title: '请阅读并同意《用户协议》和《隐私政策》',
          icon: 'none',
        });

        return;
      }

      if (!this.formState.mobile) {
        uni.showToast({
          title: '手机号错误',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/global/sms/send_code', {
          mobile: this.formState.mobile,
        })
        .then((res) => {
          uni.hideLoading();

          this.formState.sms_sign = res.data.sign;
          this.countdown = 60;
        });
    },

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

      if (!this.formState.mobile) {
        uni.showToast({
          title: '手机号错误',
          icon: 'none',
        });

        return;
      }

      if (!this.formState.sms_code) {
        uni.showToast({
          title: '验证码错误',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/user/auth/userauth/login', {
          uname: this.formState.mobile,
          sms_sign: this.formState.sms_sign,
          sms_code: this.formState.sms_code,
        })
        .then((res) => {
          // 登录完成之后保存 token
          const storageExpireDays = 7;
          const currentTime = Date.now();
          const expireTime = currentTime + storageExpireDays * 24 * 60 * 60 * 1000; // 当前时间加上7天
          uni.setStorageSync('foodDiaryToken', {
            value: res.data.token,
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
        });
    },

    oneKeyLogin(event) {
      if (event.detail.errMsg === 'getPhoneNumber:ok') {
        $http
          .post('api/user/auth/userauth/login_by_phone', {
            code: event.detail.code,
          })
          .then((res) => {
            this.$toRouter(
              '/packageLogin/pages/oneKeyLogin/oneKeyLogin',
              `phone=${res.data.phone}&token=${res.data.token}`,
            );
          });
      } else if (event.detail.errno === 1400001) {
        uni.showModal({
          title: '提示',
          content: '该功能使用次数已达当前小程序上限，暂时无法使用，请手动填写手机号',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
            }
          },
        });
      }
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
      margin-bottom: 134rpx;
    }

    .input-box {
      margin-bottom: 40rpx;

      .phone {
        width: 532rpx;
        height: 80rpx;
        background: #f3f3f3;
        border-radius: 60rpx;
        font-size: 24rpx;
        color: #313030;
        margin-bottom: 30rpx;

        input {
          padding: 0 32rpx;
          width: 100%;
          height: 100%;
        }
      }

      .password {
        width: 532rpx;
        height: 80rpx;
        background: #f3f3f3;
        border-radius: 60rpx;
        font-size: 24rpx;
        color: #313030;
        padding-right: 38rpx;
        display: flex;
        align-items: center;

        input {
          padding: 0 32rpx;
          flex-grow: 1;
          height: 100%;
        }

        .line {
          flex-shrink: 0;
          width: 2rpx;
          height: 48rpx;
          background: #5a5959;
          margin-right: 20rpx;
        }

        .get-code {
          flex-shrink: 0;
          white-space: nowrap;
          font-size: 24rpx;
          color: #313030aa;
        }
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
      margin-bottom: 44rpx;
    }

    button {
      background: transparent;
      padding: 0;
      margin: 0;

      &:after {
        border: none;
      }
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
