<template>
  <custom-dialog ref="exchangeRecodeDialog" title="兑换记录">
    <view class="content">
      <view class="recode-list">
        <template v-if="exchangeList.length">
          <view class="recode-item" v-for="item of exchangeList" :key="item.id">
            <text>{{ item.exchange_time.slice(0, 10) }}</text>
            <text>{{ item.name }}</text>
          </view>
        </template>

        <view class="empty-recode" v-else>暂无兑换记录</view>
      </view>
    </view>

    <view slot="footer" class="btn" @click="back">确定</view>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'exchangeRecodeDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      exchangeList: [],
    };
  },

  methods: {
    getExchangeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/health-tree/exchange-records', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();
          this.exchangeList = res.data.Items;
        });
    },

    open() {
      this.getExchangeList();
      this.$refs.exchangeRecodeDialog.open();
    },

    close() {
      this.$refs.exchangeRecodeDialog.close();
    },

    back() {
      this.$emit('back');
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  background: #f3f3f3;
  border-radius: 40rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .recode-list {
    display: flex;
    flex-direction: column;
    min-height: 200rpx;

    .empty-recode {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #323131cc;
      padding: 100rpx 0;
    }

    .recode-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:not(:last-child) {
        padding-bottom: 10rpx;
        margin-bottom: 10rpx;
        border-bottom: 4rpx solid #ffffff;
      }

      text {
        font-size: 20rpx;
        color: #323131;
      }
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
