<template>
  <uni-popup ref="updateWeightDataDialog">
    <view class="update-weight-data-dialog">
      <view class="title">体重记录</view>

      <view class="weight-list">
        <input type="number" v-model="currentWeight" />
        <text>公斤</text>
      </view>

      <view class="btn" @click="recodeWeight">确定</view>
    </view>
  </uni-popup>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'updateWeightDataDialog',

  props: {},

  data() {
    return {
      currentWeight: 0,
    };
  },

  methods: {
    open() {
      this.getHomeWeightPlan();
      this.$refs.updateWeightDataDialog.open();
    },

    close() {
      this.$refs.updateWeightDataDialog.close();
    },

    /**
     * 获取首页体重相关数据
     */
    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.currentWeight = res.data.current_weight;
      });
    },

    recodeWeight() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/user-weight/update', {
          weight: Number(this.currentWeight).toFixed(2),
        })
        .then(() => {
          this.$refs.updateWeightDataDialog.close();
          uni.hideLoading();
          this.$emit('updateSuccess');

          uni.showToast({
            title: '更新成功',
            icon: 'none',
          });
        });
    },
  },
};
</script>

<style scoped lang="scss">
.update-weight-data-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 32rpx 24rpx 48rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 114rpx;
  }

  .weight-list {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 116rpx;

    input {
      width: 160rpx;
      height: 60rpx;
      background: #f3f3f3;
      border-radius: 20rpx;
      text-align: center;
      font-weight: 600;
      font-size: 32rpx;
      color: #604fa6;
      margin-right: 8rpx;
    }

    text {
      font-size: 28rpx;
      color: #323131;
      padding: 0 16rpx 12rpx;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2rpx;
        background: #323131;
      }
    }
  }

  .btn {
    height: 80rpx;
    background: #e8f480;
    border-radius: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #323131;
  }
}
</style>
