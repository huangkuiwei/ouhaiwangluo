<template>
  <uni-popup ref="addRecodePopup">
    <view class="add-recode-dialog">
      <view class="title">
        <text class="title-text">饮食记录</text>
      </view>

      <view class="recode-list">
        <view
          class="recode-item"
          :class="{ active: item.type === selectRecode.type }"
          v-for="(item, index) in recodeList"
          :key="index"
          @click="onTypeChange(item)"
        >
          <view class="recode-item-content">
            <image mode="heightFix" :src="item.icon" />
            <text class="text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <view class="input-box-wrap">
        <view class="add-meal-list" v-if="selectRecode.type === 2">
          <view class="add-meal-item" v-for="(item, index) in addMealList" :key="index" @click="onTypeChange1(item)">
            <view class="add-meal-icon" :class="{ active: item.type === selectAddRecode.type }">
              <image mode="heightFix" :src="item.icon" />
            </view>

            <text class="text">{{ item.text }}</text>
          </view>
        </view>

        <view class="input-box">
          <textarea
            :value="foodText"
            @input="foodText = $event.detail.value"
            :maxlength="-1"
            placeholder="例如1个水煮蛋、1碗牛肉粉..."
          />

          <view class="tools">
            <image
              class="icon1"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/icon4.png"
              @click="selectImage"
            />

            <image
              class="icon2"
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/icon5.png"
              @click="takePhoto"
            />
          </view>
        </view>
      </view>

      <view class="submit" @click="submit">确定</view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'addFoodRecodeDialog',

  props: {
    type: {
      type: [String, Number],
    },
  },

  data() {
    return {
      foodText: '',
      recodeList: [
        {
          type: 1,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode01.png',
          text: '早餐',
        },

        {
          type: 3,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode02.png',
          text: '午餐',
        },

        {
          type: 5,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode03.png',
          text: '晚餐',
        },
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode04.png',
          text: '加餐',
        },
      ],
      addMealList: [
        {
          type: 2,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode06.png',
          text: '早加餐',
        },
        {
          type: 4,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode07.png',
          text: '午加餐',
        },
        {
          type: 6,
          icon: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/recode08.png',
          text: '晚加餐',
        },
      ],
      selectRecode: {},
      selectAddRecode: {},
    };
  },

  methods: {
    open() {
      if (this.type) {
        if (this.type === 2 || this.type === 4 || this.type === 6) {
          this.selectRecode = this.recodeList.find((item) => Number(item.type) === 2);
          this.selectAddRecode = this.addMealList.find((item) => Number(item.type) === Number(this.type));
        } else {
          this.selectRecode = this.recodeList.find((item) => Number(item.type) === Number(this.type));
          this.selectAddRecode = {};
        }
      } else {
        this.selectRecode = this.recodeList[0];
        this.selectAddRecode = {};
      }

      this.$refs.addRecodePopup.open();
    },

    close() {
      this.$refs.addRecodePopup.close();
    },

    onTypeChange(item) {
      if (item.type === 2) {
        this.selectAddRecode = this.addMealList[0];
      } else {
        this.selectAddRecode = {};
      }

      this.selectRecode = item;
    },

    onTypeChange1(item) {
      this.selectAddRecode = item;
    },

    submit() {
      if (!this.selectRecode.type) {
        uni.showToast({
          title: '请选择饮食类型',
          icon: 'none',
        });

        return;
      }

      if (!this.foodText.trim()) {
        uni.showToast({
          title: '请填写记录',
          icon: 'none',
        });

        return;
      }

      let type = this.selectAddRecode.type || this.selectRecode.type;

      this.$emit('addRecode', {
        text: this.foodText,
        type: type,
        input_type: 1,
      });
    },

    selectImage() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          let filePath = res.tempFiles[0].tempFilePath;

          this.$emit('addImageRecode', {
            url: filePath,
            type: this.selectRecode.type,
            input_type: 2,
          });
        },
      });
    },

    takePhoto() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        success: (res) => {
          let filePath = res.tempFiles[0].tempFilePath;

          this.$emit('addImageRecode', {
            url: filePath,
            type: this.selectRecode.type,
            input_type: 2,
          });
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.add-recode-dialog {
  width: 702rpx;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 32rpx 20rpx 48rpx;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14rpx;

    .title-text {
      font-weight: 600;
      font-size: 28rpx;
      color: #000000;
    }
  }

  .recode-list {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-bottom: 12rpx;

    .recode-item {
      width: 76rpx;
      height: 120rpx;

      &.active {
        background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg6.png') left top/100% 100%
          no-repeat;
      }

      .recode-item-content {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        image {
          height: 64rpx;
        }

        .text {
          font-size: 16rpx;
          color: #323131;
        }
      }
    }
  }

  .input-box-wrap {
    display: flex;
    margin-bottom: 24rpx;

    .add-meal-list {
      padding-top: 14rpx;
      display: flex;
      flex-direction: column;
      gap: 16rpx;

      .add-meal-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .add-meal-icon {
          width: 86rpx;
          height: 68rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4rpx;

          &.active {
            background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/index/bg7.png') left top/100%
              100% no-repeat;
          }

          image {
            height: 60rpx;
          }
        }

        text {
          font-size: 16rpx;
          color: #323131;
        }
      }
    }

    .input-box {
      flex-grow: 1;
      height: 320rpx;
      background: #f3f3f3;
      border-radius: 20rpx;
      display: flex;
      flex-direction: column;
      padding: 22rpx 8rpx 10rpx;
      position: relative;

      textarea {
        width: 100%;
        flex-grow: 1;
        font-size: 24rpx;
        color: #000000;
        line-height: 40rpx;
      }

      .tools {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 20rpx;

        .icon1,
        .icon2 {
          width: 60rpx;
        }
      }
    }
  }

  .submit {
    width: 100%;
    height: 80rpx;
    background: #e8f480;
    border-radius: 60rpx;
    font-size: 28rpx;
    color: #323131;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
