<template>
  <uni-popup ref="updateHeightDialog" type="bottom" :safe-area="false">
    <view class="update-height-dialog">
      <view class="title">身高</view>

      <view class="list">
        <picker-view
          indicator-style="height: 40px;"
          style="width: 100%; height: 200px"
          :value="value"
          @change="value = $event.detail.value"
        >
          <picker-view-column>
            <view
              class="item"
              :class="{
                active: value[0] === index,
              }"
              v-for="(item, index) in list"
              :key="index"
            >
              <text class="value">{{ item }}</text>
              <text class="unit" v-if="value[0] === index">厘米</text>
            </view>
          </picker-view-column>
        </picker-view>
      </view>

      <view class="options">
        <text @click="submit">保存</text>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'updateHeightDialog',

  data() {
    return {
      localUserDetailInfo: {},
      value: [0],
    };
  },

  props: {
    list: {
      type: Array,
      default: () => [],
    },

    userDetailInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  methods: {
    open() {
      this.localUserDetailInfo = JSON.parse(JSON.stringify(this.userDetailInfo));
      this.value = [this.localUserDetailInfo.height];

      this.$refs.updateHeightDialog.open();
    },

    close() {
      this.$refs.updateHeightDialog.close();
    },

    submit() {
      Object.assign(this.localUserDetailInfo, {
        height: this.value[0],
      });

      this.$emit('submit', this.localUserDetailInfo);
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.update-height-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 30rpx 48rpx 48rpx;

  .title {
    font-weight: 600;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
    margin-bottom: 56rpx;
  }

  .list {
    margin-bottom: 44rpx;

    picker-view {
      picker-view-column {
        .item {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            .value {
              background: #dbd3ff;
              padding: 12rpx 26rpx;
              border-radius: 60rpx;
            }

            .unit {
              color: #dbd3ff;
            }
          }

          .value {
            font-size: 28rpx;
            color: #323131;
          }

          .unit {
            font-size: 24rpx;
            margin-left: 15rpx;
            position: relative;
            top: 4rpx;
          }
        }
      }
    }
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    text {
      width: 200rpx;
      height: 60rpx;
      background: #e8f480;
      border-radius: 60rpx;
      font-size: 24rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
