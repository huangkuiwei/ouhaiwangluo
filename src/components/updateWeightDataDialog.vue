<template>
  <uni-popup ref="updateWeightDataDialog">
    <view class="update-weight-data-dialog">
      <view class="title">体重记录</view>

      <view class="weight-list">
        <view class="list">
          <picker-view
            indicator-style="height: 60rpx;"
            style="width: 100%; height: 180rpx"
            :value="currentWeight"
            @change="currentWeight = $event.detail.value"
          >
            <picker-view-column>
              <view
                class="item"
                :class="{
                  active: currentWeight[0] === index,
                }"
                v-for="(item, index) in rulerLineList1"
                :key="index"
              >
                <text class="value">{{ item }}</text>
              </view>
            </picker-view-column>
          </picker-view>
        </view>

        <text class="unit">公斤</text>
      </view>

      <view class="btn" @click="recodeWeight">确定</view>
    </view>
  </uni-popup>
</template>

<script>
import $http from '@/utils/http';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'updateWeightDataDialog',

  props: {},

  data() {
    let rulerLineList1 = [];

    for (let i = 0; i < 401; i++) {
      rulerLineList1.push(Number((i * 0.5).toFixed(1)));
    }

    return {
      currentWeight: [0],
      rulerLineList1,
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    open() {
      this._getUserDetailInfo().then(() => {
        let index = this.rulerLineList1.findIndex(
          (item) => Number(item) === Number(this.userDetailInfo.current_weight),
        );

        if (index !== -1) {
          this.currentWeight = [index];
        }
      });

      this.$refs.updateWeightDataDialog.open();
    },

    close() {
      this.$refs.updateWeightDataDialog.close();
    },

    recodeWeight() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/user-weight/update', {
          weight: this.rulerLineList1[this.currentWeight[0]],
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

    .list {
      width: 160rpx;

      picker-view {
        width: 100%;
        margin-right: 8rpx;

        .item {
          width: 100%;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            background: #f3f3f3;
            border-radius: 20rpx;
            font-weight: 600;
            font-size: 32rpx;
            color: #604fa6;
          }
        }
      }
    }

    .unit {
      font-size: 28rpx;
      color: #323131;
      padding: 0 16rpx 12rpx;
      position: relative;
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
