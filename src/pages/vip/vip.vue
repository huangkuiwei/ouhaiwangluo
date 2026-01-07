<template>
  <view class="vip-page">
    <view class="page-title">
      <text>会员开通</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="userinfo">
      <view class="left">
        <image
          mode="aspectFill"
          :src="
            userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'
          "
        />
      </view>

      <view class="right" v-if="isLogin">
        <text>{{ userInfo.uname }}</text>
        <text>{{ isVip ? '您已开通会员' : '您还未开通会员' }}</text>
      </view>

      <view class="right" v-else @click="$toRouter('/packageLogin/pages/login/login')">
        <text>登录/注册</text>
        <text>点击登录/注册</text>
      </view>
    </view>

    <view class="vip-info">
      <view class="vip-shop-list">
        <view
          class="item"
          @click="selectedVip = item"
          :class="{ active: selectedVip.id === item.id }"
          v-for="item of vipList"
          :key="item.id"
        >
          <view class="recommend" v-if="item.is_recommend">推荐</view>

          <view class="top-part"></view>
          <view class="item-detail">
            <view class="name">{{ item.product_name }}</view>
            <view class="price">
              <text>￥</text>
              <text>{{ item.price }}</text>
            </view>
            <view class="tip">{{ Number((item.select_percentage * 100).toFixed(2)) }}%用户选择</view>
          </view>
        </view>
      </view>

      <view class="container">
        <view class="desc">
          <view class="desc-item">
            <view>会员权益</view>
            <view>非会员</view>
            <view>会员</view>
          </view>

          <view class="desc-item">
            <view>专属饮食计划</view>
            <view></view>
            <view>
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon2.png" />
            </view>
          </view>

          <view class="desc-item">
            <view>专属健康管家</view>
            <view></view>
            <view>
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon2.png" />
            </view>
          </view>

          <view class="desc-item">
            <view>专属健身教练</view>
            <view></view>
            <view>
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon2.png" />
            </view>
          </view>

          <view class="desc-item">
            <view>智能记录饮食</view>
            <view>
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon2.png" />
            </view>
            <view>
              <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon2.png" />
            </view>
          </view>
        </view>

        <view class="buy-box">
          <template v-if="showShopInfo">
            <view class="btn" style="margin-bottom: 24rpx" @click="submit(selectedVip, openid, userInfo.phone)">
              {{ isVip ? '立即续费' : '立即开通' }}
            </view>
            <view class="agreement">
              <checkbox-group @change="agree = $event.detail.value">
                <label>
                  <checkbox color="#E8F480" value="1" :checked="agree.includes('1')" />
                </label>

                <text>
                  我已阅读并同意
                  <text @click="$toRouter('/packageLogin/pages/protocol/protocol')">《用户协议》</text>
                  和
                  <text @click="$toRouter('/packageLogin/pages/privacy/privacy')">《隐私政策》</text>
                </text>
              </checkbox-group>
            </view>
          </template>

          <template v-else>
            <button class="btn" open-type="contact">联系客服</button>
            <view class="buy-tip">由于相关规定，iOS版小程序暂不支持购买</view>
          </template>
        </view>

        <view class="rule">
          <view class="rule-title">以下内容请您知悉</view>
          <view>1.会员服务属于虚拟商品，是一项特殊服务，会员开通成功后概不退款，故请先试用满意后再开通</view>
          <view>2.会员价格会随着功能的完善会逐步涨价，现在开通最划算</view>
          <view>3.会员时长到期后不会自动续费</view>
          <view>4.有任何开通会员问题请联系客服咨询</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import $http from '@/utils/http';
import { onPay } from '@/pages/vip/member';
import { toRouter } from '@/utils';

export default {
  name: 'vip',

  data() {
    const platform = uni.getDeviceInfo().platform;

    return {
      vipList: [],
      selectedVip: {},
      agree: [],
      openid: null,
      // showShopInfo: false, // 测试
      showShopInfo:
        (process.env.UNI_PLATFORM === 'mp-weixin' && platform !== 'ios') || process.env.UNI_PLATFORM !== 'mp-weixin',
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),
    ...mapGetters('app', ['isLogin', 'isVip']),
  },

  onLoad() {
    uni.login({
      success: (res) => {
        $http
          .post('api/user/auth/userauth/get_openid', {
            code: res.code,
            micro_appid: uni.getAccountInfoSync().miniProgram.appId,
          })
          .then((res) => {
            this.openid = res.data;
          });
      },
    });

    this.getProductList();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    submit(price, openid, mobile) {
      if (!this.isLogin) {
        uni.showModal({
          title: '提示',
          content: '您当前未登录或登录已失效，为了您有更好的体验，OUHI需要您进行授权登录',
          showCancel: true,
          success: (res) => {
            if (res.confirm) {
              toRouter('/packageLogin/pages/login/login');
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          },
        });

        return;
      }

      if (!this.agree.includes('1')) {
        uni.showToast({
          title: '请先阅读并同意协议',
          icon: 'none',
        });

        return;
      }

      onPay(price, openid, mobile);
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

    getProductList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http.get('api/global/product/get').then((res) => {
        uni.hideLoading();

        // TODO 连续包月
        // res.data.splice(1, 0, {
        //   id: 10003,
        //   is_recommend: false,
        //   original_price: 4200,
        //   price: 2990,
        //   product_des: '月会员',
        //   product_name: '连续包月',
        //   select_percentage: 0.1,
        // });

        res.data.forEach((item) => {
          // if (item.id === 10000) {
          //   item.select_percentage = 0.2;
          // } else if (item.id === 10001) {
          //   item.select_percentage = 0.3;
          // } else if (item.id === 10002) {
          //   item.select_percentage = 0.2;
          // } else if (item.id === 10003) {
          //   item.select_percentage = 0.3;
          // }

          item.price = Number((item.price / 100).toFixed(2));
          item.original_price = Number((item.original_price / 100).toFixed(2));
        });

        this.vipList = res.data;
        this.selectedVip = this.vipList[0];
      });
    },
  },
};
</script>

<style scoped lang="scss">
.vip-page {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 14rpx;
  }

  .userinfo {
    padding: 46rpx 60rpx 40rpx;
    background: #ffffff url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/icon1.png') right 32rpx top 0 /226rpx
      auto no-repeat;
    display: flex;
    align-items: center;

    .left {
      flex-shrink: 0;
      margin-right: 20rpx;

      image {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
      }
    }

    .right {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 16rpx;

      text {
        &:nth-child(1) {
          font-weight: 600;
          font-size: 32rpx;
          color: #323131;
        }

        &:nth-child(2) {
          font-size: 28rpx;
          color: #323131cc;
        }
      }
    }
  }

  .vip-info {
    padding: 0 0 160rpx;
    border-radius: 40rpx 40rpx 0 0;
    background: #fcffea;
    position: relative;

    .vip-shop-list {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 48rpx 28rpx 0 28rpx;
      overflow: auto;
      margin-bottom: 30rpx;

      .item {
        width: 220rpx;
        flex-shrink: 0;
        position: relative;
        display: flex;
        flex-direction: column;

        .recommend {
          position: absolute;
          left: 60rpx;
          top: 6rpx;
          width: 100rpx;
          height: 34rpx;
          background: #b3a1ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 22rpx;
          color: #323131;
          border-radius: 16rpx;
        }

        &.active {
          .item-detail {
            background: #ffffff;
            border: 4rpx solid #b3a1ff;
          }
        }

        .top-part {
          flex-shrink: 0;
          height: 20rpx;
        }

        .item-detail {
          flex-grow: 1;
          border-radius: 20rpx;
          background: #f3f3f3;
          padding: 90rpx 24rpx 60rpx;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 4rpx solid transparent;

          .name {
            font-size: 28rpx;
            color: #323131;
            margin-bottom: 12rpx;
          }

          .price {
            padding-bottom: 2rpx;
            margin-bottom: 10rpx;
            border-bottom: 2rpx solid #323131;

            text {
              color: #323131;

              &:nth-child(1) {
                font-size: 32rpx;
              }

              &:nth-child(2) {
                font-weight: 600;
                font-size: 60rpx;
              }
            }
          }

          .tip {
            text-align: center;
            font-size: 20rpx;
            color: #323131;
          }
        }
      }
    }

    .container {
      padding: 0 24rpx;

      .desc {
        width: 100%;
        background: #e7e1ff;
        border-radius: 20rpx;
        padding: 30rpx 20rpx 20rpx;
        gap: 30rpx;
        margin-bottom: 38rpx;

        .desc-item {
          display: flex;
          align-items: center;

          view {
            width: 40%;

            &:nth-child(2),
            &:nth-child(3) {
              width: 30%;
              text-align: center;
            }
          }

          &:nth-child(1) {
            font-weight: 500;
            font-size: 32rpx;
            color: #323131;
            margin-bottom: 28rpx;
          }

          &:not(:nth-child(1)) {
            font-size: 28rpx;
            color: #323131;
            margin-bottom: 10rpx;

            image {
              width: 64rpx;
            }
          }
        }
      }

      .buy-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60rpx;

        .btn {
          width: 532rpx;
          height: 100rpx;
          background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/buy/bg1.png') left top/100% 100%
            no-repeat;
          border-radius: 60rpx 60rpx 60rpx 60rpx;
          font-weight: 600;
          font-size: 32rpx;
          color: #323131;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20rpx;
        }

        .agreement {
          font-size: 20rpx;
          color: #5a5959;
          display: flex;
          align-items: center;
          justify-content: center;

          checkbox-group {
            checkbox {
              transform: scale(0.55);
            }
          }
        }

        .buy-tip {
          font-size: 20rpx;
          color: #5a5959;
        }
      }

      .rule {
        padding: 0 60rpx;
        font-size: 20rpx;
        color: #5a5959;

        view {
          line-height: 32rpx;

          &.rule-title {
            font-size: 24rpx;
          }
        }
      }
    }
  }
}
</style>
