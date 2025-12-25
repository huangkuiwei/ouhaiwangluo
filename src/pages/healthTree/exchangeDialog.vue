<template>
  <custom-dialog ref="exchangeDialog" title="兑换">
    <view class="content">
      <view class="score">
        <view class="height">小树高度：{{ (signInfo.tree_height / 100).toFixed(2) }}米</view>
        <view class="recode" @click="openExchangeRecodeDialog">兑换记录</view>
      </view>

      <view class="exchange-title">
        <text>栽培小树兑换会员</text>
      </view>

      <view class="exchange-list">
        <view class="exchange-item" v-for="item of exchangeList" :key="item.id">
          <view class="left">
            <text>{{ item.name }}</text>
          </view>

          <view class="right" @click="exchange(item)">兑换</view>
        </view>
      </view>

      <view class="tips">
        <view>小树长至1.8米可收获兑换月度会员</view>
        <view>小树长至5米可收获兑换季度会员</view>
        <view>小树长至10米可收获兑换年度会员</view>
      </view>
    </view>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'exchangeDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      exchangeList: [],
      signInfo: {},
    };
  },

  methods: {
    getSignInfo() {
      return $http.get('api/health-tree/account-info').then((res) => {
        this.signInfo = res.data;
      });
    },

    getExchangeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http.get('api/health-tree/available-exchanges').then((res) => {
        uni.hideLoading();

        this.exchangeList = res.data;
      });
    },

    open() {
      this.getSignInfo();
      this.getExchangeList();
      this.$refs.exchangeDialog.open();
    },

    close() {
      this.$refs.exchangeDialog.close();
    },

    openExchangeRecodeDialog() {
      this.$emit('openExchangeRecodeDialog');
      this.close();
    },

    exchange(item) {
      uni.showModal({
        title: '温馨提示',
        content: '确定要兑换此商品吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '加载中...',
              mask: true,
            });

            $http
              .post('api/health-tree/exchange-vip', {
                exchange_type: item.exchange_type,
              })
              .then(() => {
                uni.hideLoading();

                uni.showToast({
                  title: '兑换成功',
                  mask: true,
                  icon: 'none',
                });

                this.getSignInfo();
                this.getExchangeList();
              });
          }
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  display: flex;
  flex-direction: column;

  .score {
    text-align: right;

    .height {
      font-size: 24rpx;
      color: #323131;
      margin-bottom: 4rpx;
    }

    .recode {
      font-size: 24rpx;
      color: #32313190;
    }
  }

  .exchange-title {
    margin-bottom: 10rpx;

    text {
      font-size: 24rpx;
      color: #323131;
    }
  }

  .exchange-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-bottom: 78rpx;

    .exchange-item {
      background: #fcffea;
      border-radius: 20rpx;
      padding: 40rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left {
        display: flex;
        flex-direction: column;

        text {
          font-weight: 600;
          font-size: 24rpx;
          color: #323131;
        }
      }

      .right {
        &.disabled {
          background: #f3f3f3;
        }

        background: #e8f480;
        border-radius: 10rpx;
        width: 120rpx;
        height: 40rpx;
        font-size: 24rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .tips {
    display: flex;
    flex-direction: column;
    padding-left: 160rpx;
    gap: 10rpx;
    font-size: 20rpx;
    color: #323131cc;
  }
}
</style>
