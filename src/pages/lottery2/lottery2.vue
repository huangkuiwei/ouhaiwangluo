<template>
  <view class="lottery-page">
    <view class="title">
      <view class="title1">看视频 领现金</view>
      <view class="title2">限时领取 最高可得100元</view>
    </view>

    <view class="hb-box">
      <image
        class="icon1"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/icon1.png"
      />

      <view class="countdown">
        <uni-countdown
          backgroundColor="#fab1a8"
          splitorColor="#1a1a1a"
          color="#1a1a1a"
          :showDay="false"
          :hour="23"
          :minute="59"
          :second="59"
        />
        <text>后红包清零</text>
      </view>

      <view class="total">
        <view class="total-title">累计收入</view>
        <view class="number">
          <text>{{ totalHbNumber }}</text
          >元
        </view>
      </view>
    </view>

    <view class="draw-list">
      <view
        class="draw-item"
        :class="{ active: selectPrize === item }"
        v-for="item of prizeList.slice(0, 2)"
        :key="item"
      >
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/icon2.png" />
      </view>
    </view>

    <view class="draw-list">
      <view class="draw-item" :class="{ active: selectPrize === item }" v-for="item of prizeList.slice(2)" :key="item">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/icon2.png" />
      </view>
    </view>

    <view class="draw-user-box">
      <view class="question-list">
        <view class="question-detail">
          <!-- 弹幕显示区域 -->
          <view class="danmu-container" id="danmuContainer">
            <view
              v-for="(item, index) in activeDanmus"
              :key="index"
              class="danmu-item"
              :style="{
                top: item.top + 'px',
                animationDuration: item.duration + 's',
              }"
              @click="jumpAi(jkzsChat, item.text)"
            >
              {{ item.text }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-box">
      <view class="tip">看的越多 赚的越多</view>
      <image
        class="btn"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/btn.png"
        @click="lookAdv"
      />
      <view class="enter-mp" @click="$toSwitch('/pages/index/index')">点击进入小程序</view>
    </view>

    <uni-popup ref="drawHongbaoDialog" maskBackgroundColor="rgba(0, 0, 0, 0.5)">
      <view class="draw-dialog" @click="$refs.drawHongbaoDialog.close()">
        <view class="title">现金红包</view>
        <view class="number">
          <text>0.1</text>
          <text>元</text>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="noDrawDialog" maskBackgroundColor="rgba(0, 0, 0, 0.5)">
      <view class="no-draw-dialog">
        <view class="title">很遗憾没中奖</view>
        <view class="tip">别气馁，观看视频获得抽奖资格～</view>

        <image
          class="btn"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/lottery/btn4.png"
          @click="again"
        />

        <image
          class="close"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/lottery/close.png"
          @click="$refs.noDrawDialog.close()"
        />
      </view>
    </uni-popup>
  </view>
</template>

<script>
let videoAd = null;

export default {
  name: 'lottery2',

  data() {
    return {
      drawing: false,
      drawCount: 0,
      sign_order_no: null,
      totalHbNumber: 0,
      allDanmuData: [
        { text: '等风**已提现2.12元' },
        { text: '体验**已提现1.02元' },
        { text: '年时**已提现1.85元' },
        { text: '你会**已提现5.21元' },
        { text: '弥补**已提现4.1元' },
        { text: '那你**已提现2.58元' },
        { text: '计划**已提现2.11元' },
        { text: '不会**已提现0.52元' },
        { text: '破灭**已提现3.88元' },
        { text: '不同**已提现0.1元' },
        { text: '一天**已提现1.2元' },
        { text: '啊哟**已提现1.21元' },
        { text: '爱你**已提现4.21元' },
        { text: '谜语**已提现2.98元' },
        { text: '一条**已提现1.02元' },
        { text: '关于**已提现0.52元' },
        { text: '覆盖**已提现0.1元' },
        { text: '独特**已提现1.77元' },
        { text: '我要**已提现0.1元' },
        { text: '区域**已提现3.21元' },
      ],
      topList: [0, 35],
      activeDanmus: [], // 当前屏幕上显示的弹幕
      containerHeight: 62, // 容器高度
      danmuIndex: 0, // 用于循环取弹幕数据的索引
      sendInterval: null, // 定时器ID
      prizeList: [1, 2, 3, 4, 5],
      selectPrize: 0,
    };
  },

  onLoad(options) {
    let draw = options.draw;

    if (draw === 'true') {
      this.drawCount += 1;

      setTimeout(() => {
        this.getDraw();
      }, 500);
    }

    this.sign_order_no = uni.getStorageSync('sign_order_no');

    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-743e5de3e5a2029e',
      });
      videoAd.onLoad(() => {});
      videoAd.onError((err) => {
        console.error('激励视频广告加载失败', err);
      });
      videoAd.onClose((res) => {
        // 奖励一次抽奖机会
        if (res.isEnded) {
          this.drawCount += 1;
          uni.showToast({
            title: '观看成功，获得一次抽奖机会',
            icon: 'none',
          });

          setTimeout(() => {
            this.getDraw();
          }, 500);
        }
      });
    }
  },

  onHide() {
    this.activeDanmus = [];
  },

  onShow() {
    this.startDanmu();
  },

  methods: {
    startDanmu() {
      this.sendSingleDanmu();

      // 每隔一定时间发送一条弹幕
      this.sendInterval = setInterval(() => {
        this.sendSingleDanmu();
      }, 1800);
    },

    sendSingleDanmu() {
      // 循环获取弹幕数据
      const danmuData = this.allDanmuData[this.danmuIndex % this.allDanmuData.length];
      this.danmuIndex++;

      const newDanmu = {
        text: danmuData.text,
        top: this.topList[this.danmuIndex % this.topList.length],
        duration: 15,
      };

      this.activeDanmus.push(newDanmu);
    },

    async getDraw() {
      if (!this.drawCount) {
        this.lookAdv();
        return;
      }

      let timer = setInterval(() => {
        if (this.selectPrize >= 5) {
          this.selectPrize = 1;
        } else {
          this.selectPrize += 1;
        }
      }, 300);

      this.drawing = true;
      await this.sleep(2000 + Math.random() * 2000);

      uni.request({
        method: 'POST',
        url: `https://hsdzapi.laketay.com/api/open/order/cashgift/lucky_draw`,
        data: {
          external_agreement_no: this.sign_order_no,
        },
        success: async (res) => {
          if (res.statusCode !== 200) {
            uni.showToast({
              title: `接口异常：${res.statusCode}`,
              icon: 'none',
            });

            return;
          }

          if (res.data.Code === 0 || res.data.code === 0) {
            this.drawCount -= 1;

            if (Number(res.data.data.lucky_result) === 1) {
              this.totalHbNumber = Number((this.totalHbNumber + 0.1).toFixed(2));
              this.$refs.drawHongbaoDialog.open();
              let mchId = res.data.data.mch_id;
              let appid = res.data.data.appid;
              let package1 = res.data.data.package;

              await this.merchantTransfer(mchId, appid, package1).catch(() => {});
            } else {
              this.$refs.noDrawDialog.open();
            }
          } else {
            uni.showToast({
              title: res.data.msg || res.data.Msg,
              icon: 'none',
              mask: true,
            });
          }
        },

        fail: () => {},

        complete: () => {
          clearInterval(timer);
          this.selectPrize = 0;
          this.drawing = false;
        },
      });
    },

    again() {
      this.$refs.noDrawDialog.close();
      this.lookAdv();
    },

    merchantTransfer(mchId, appid, package1) {
      return new Promise((resolve, reject) => {
        uni.requestMerchantTransfer({
          mchId: mchId,
          appId: appid,
          package: package1,
          success: (res1) => {
            console.log('res1:', res1);

            // res.err_msg将在页面展示成功后返回应用时返回ok，并不代表付款成功
            if (res1.errMsg === 'requestMerchantTransfer:ok') {
            }
            resolve(res1);
          },
          fail: (error) => {
            console.log('error:', error, mchId, appid, package1);
            uni.showToast({
              title: error.errMsg,
              icon: 'none',
            });

            reject(error);
          },
        });
      });
    },

    sleep(time) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    },

    lookAdv() {
      if (videoAd) {
        videoAd.show().catch(() => {
          // 失败重试
          videoAd
            .load()
            .then(() => videoAd.show())
            .catch((err) => {
              console.error('激励视频广告显示失败', err);

              uni.showToast({
                title: err.errDetail || '激励视频广告显示失败',
                icon: 'none',
              });
            });
        });
      }
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
.lottery-page {
  height: 100%;
  overflow: auto;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/bg.png') left top/100% 100%
    no-repeat;
  padding: 180rpx 0 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 45rpx;
    margin-bottom: 72rpx;

    .title1 {
      font-weight: bold;
      font-size: 85rpx;
      color: #ffffff;
    }

    .title2 {
      font-weight: 500;
      font-size: 35rpx;
      color: #ffea00;
    }
  }

  .hb-box {
    width: 668rpx;
    height: 135rpx;
    background: #fde7e5;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 69rpx;

    .icon1 {
      width: 98rpx;
      margin-right: 20rpx;
    }

    .countdown {
      display: flex;
      align-items: center;
      gap: 10rpx;
      font-size: 30rpx;
      color: #1a1a1a;
      margin-right: 30rpx;
    }

    .total {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 19rpx;
      border-left: 2rpx solid #fcd8cd;
      gap: 20rpx;

      .total-title {
        font-size: 30rpx;
        color: #1a1a1a;
      }

      .number {
        font-weight: bold;
        font-size: 24rpx;
        color: #f32f2f;

        text {
          font-size: 35rpx;
        }
      }
    }
  }

  .draw-list {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 65rpx;
    margin-bottom: 60rpx;

    .draw-item {
      position: relative;

      &.active {
        transition: all 0.2s;
        transform: scale(1.2);
      }

      image {
        width: 162rpx;
      }

      @keyframes scale {
        0% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.4);
        }

        100% {
          transform: scale(1);
        }
      }

      .point {
        position: absolute;
        right: -50rpx;
        top: 120rpx;
        width: 99rpx;
        animation: scale 1s infinite linear;
      }
    }
  }

  .draw-user-box {
    align-self: stretch;
    margin-bottom: 49rpx;

    .question-list {
      width: 100%;

      .question-detail {
        height: 62px;
        display: flex;
        flex-direction: column;

        .danmu-container {
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;

          .danmu-item {
            position: absolute;
            left: 100%;
            white-space: nowrap;
            font-size: 24rpx;
            color: #674011;
            background: #faf2de;
            border-radius: 27rpx;
            height: 27px;
            padding: 0 28rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: slideIn linear forwards;
          }

          @keyframes slideIn {
            to {
              transform: translateX(-1440rpx); /* 移动到屏幕左侧外 */
            }
          }
        }
      }
    }
  }

  .bottom-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .tip {
      font-weight: 500;
      font-size: 35rpx;
      color: #f32f2f;
      margin-bottom: 15rpx;
    }

    .btn {
      width: 505rpx;
    }

    .enter-mp {
      position: relative;
      top: -10rpx;
      font-size: 24rpx;
      color: #333333;
      padding-bottom: 10rpx;
      border-bottom: 2rpx solid #333333;
    }
  }
}

.draw-dialog {
  width: 652rpx;
  height: 854rpx;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/lottery2/bg2.png') left top/100% 100%
    no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    padding-top: 163rpx;
    font-weight: 500;
    font-size: 30rpx;
    color: #fffeed;
    margin-bottom: 214rpx;
  }

  .number {
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      color: #ffea00;

      &:nth-child(1) {
        font-size: 110rpx;
      }

      &:nth-child(2) {
        font-size: 50rpx;
        position: relative;
        top: -20rpx;
      }
    }
  }
}

.no-draw-dialog {
  width: 683rpx;
  height: 926rpx;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app3/lottery/bg2.png') left top/100% 100%
    no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    padding-top: 400rpx;
    font-weight: 600;
    font-size: 54rpx;
    color: #991000;
    margin-bottom: 26rpx;
  }

  .tip {
    font-size: 24rpx;
    color: #5a5a5a;
    margin-bottom: 58rpx;
  }

  .btn {
    width: 332rpx;
    margin-bottom: 96rpx;
  }

  .close {
    width: 55rpx;
  }
}
</style>
