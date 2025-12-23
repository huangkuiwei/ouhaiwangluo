<template>
  <uni-popup ref="updateBirthDialog" type="bottom" :safe-area="false">
    <view class="update-birth-dialog">
      <view class="title">出生年月</view>

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
              v-for="(item, index) in years"
              :key="index"
            >
              <text class="value">{{ item }}</text>
              <text class="unit" v-if="value[0] === index">年</text>
            </view>
          </picker-view-column>

          <picker-view-column>
            <view
              class="item"
              :class="{
                active: value[1] === index,
              }"
              v-for="(item, index) in months"
              :key="index"
            >
              <text class="value">{{ item }}</text>
              <text class="unit" v-if="value[1] === index">月</text>
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
  name: 'updateBirthDialog',

  data() {
    const years = [];
    const months = [];

    for (let i = 1925; i < 2025; i++) {
      years.push(String(i));
    }

    for (let i = 1; i <= 12; i++) {
      months.push(i < 10 ? '0' + i : String(i));
    }

    return {
      localUserDetailInfo: {},
      years,
      months,
      value: [0, 0],
    };
  },

  props: {
    userDetailInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  methods: {
    open() {
      this.localUserDetailInfo = JSON.parse(JSON.stringify(this.userDetailInfo));
      let year = this.localUserDetailInfo.birth_year.slice(0, 4);
      let month = this.localUserDetailInfo.birth_year.slice(-2);

      let index1 = this.years.findIndex((item) => item === year);
      let index2 = this.months.findIndex((item) => item === month);

      if (index1 > -1 && index2 > -1) {
        this.value = [index1, index2];
      }

      this.$refs.updateBirthDialog.open();
    },

    close() {
      this.$refs.updateBirthDialog.close();
    },

    submit() {
      let birth_year = this.years[this.value[0]] + '/' + this.months[this.value[1]];

      Object.assign(this.localUserDetailInfo, {
        birth_year: birth_year,
      });

      this.$emit('submit', this.localUserDetailInfo);
      this.close();
    },
  },
};
</script>

<style scoped lang="scss">
.update-birth-dialog {
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
    padding: 0 100rpx;
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
