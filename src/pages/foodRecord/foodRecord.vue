<template>
  <view class="ai-chat-page">
    <view class="page-title">
      <text>{{ aiName }}</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <scroll-view class="chat-box" :scroll-y="true" :show-scrollbar="false" :scroll-top="scrollTop">
      <view class="chat-list">
        <view
          class="chat-item"
          :class="{
            question: item.role === 1,
            answer: item.role === 2,
            foodListBox: item.role === 3,
            evaluationList: item.role === 4,
            evaluationList2: item.role === 5,
          }"
          v-for="item of chatList"
          :key="item.id"
        >
          <template v-if="item.role === 1">
            <image v-if="item.img" mode="widthFix" :src="item.img" />
            <text v-else>{{ item.content }}</text>
          </template>

          <towxml v-else-if="item.role === 2" :nodes="item.content"></towxml>

          <view class="food-list-wrap" v-else-if="item.role === 3">
            <view class="food-container">
              <!-- TODO 数据 -->
              <view class="title">
                <text>12-09</text>
                <text>早餐</text>
              </view>

              <view class="total">845千卡</view>

              <view class="food-list">
                <view class="food-item" v-for="item1 of item.foodList" :key="item1.id">
                  <view class="middle">{{ item1.name }}{{ item1.weight }}克</view>
                  <view class="right">{{ item1.calorie }}千卡</view>
                </view>
              </view>
            </view>

            <view class="save" v-if="item.hasSave">已保存</view>
            <view class="save" v-else @click="saveAndAnalysis(item)">保存并分析</view>
          </view>

          <view class="evaluation-list" v-else-if="item.role === 4">
            <view class="evaluation-item" v-for="item1 of item.evaluationList" :key="item1.title">
              <text class="title">{{ item1.title }}</text>
              <text class="content">{{ item1.content }}</text>
            </view>
          </view>

          <view class="evaluation-list2" v-else-if="item.role === 5">
            <!-- TODO -->
            <view>
              <text>饮食评价：</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="message-box">
      <view class="ai-tip"> 本服务为AI生成内容，结果仅供参考 </view>

      <view class="input-box">
        <input type="text" :value="questionText" @input="questionText = $event.detail.value" />
      </view>

      <view class="send" :class="{ disabled: answering }" @click="sendMessage">发送</view>
    </view>
  </view>
</template>

<script>
import { verifyIsLogin } from '@/utils';
import $http from '@/utils/http';

export default {
  name: 'aiChat',

  data() {
    return {
      type: 1,
      aiName: '饮食速记',
      scrollTop: 99999,
      chatList: [],
      questionText: '',
      answering: false,
      thinkText: '正在思考，请稍等...',
      date_time: new Date().format(),
      evaluationList: [],
    };
  },

  onLoad(options) {
    if (options.type) {
      this.type = options.type;
    }

    this.chatList = [
      {
        id: Math.random().toString(),
        role: 2,
        content: this.$towxml(
          '你好，我可以快速为你记录饮食，描述的越清晰，数据记录越准确。\n' +
            '你可以这样问说：\n' +
            '“今天早上吃了两个肉包子”\n' +
            '“今天中午吃了l香干炒肉，一碗混沌”\n',
          'markdown',
        ),
        img: '',
      },
    ];

    if (options.text) {
      this.chatList.push({
        id: Math.random().toString(),
        role: 1,
        content: decodeURIComponent(options.text),
        img: '',
      });

      this.analysisData(this.type, 1, decodeURIComponent(options.text), this.date_time);
    }

    if (options.url) {
      this.chatList.push({
        id: Math.random().toString(),
        role: 1,
        content: '',
        img: decodeURIComponent(options.url),
      });

      this.answering = true;

      uni.showLoading({
        title: '正在分析...',
        mask: true,
      });

      $http
        .upload('api/baseai/image-analysis', decodeURIComponent(options.url), 'image')
        .then((res) => {
          if (res.data && !res.data.length) {
            this.chatList.push({
              id: Math.random().toString(),
              role: 2,
              content: this.$towxml('未检出到食物，请重新输入', 'markdown'),
              img: '',
            });

            this.answering = false;
            uni.hideLoading();
            return;
          }

          let analysisText = res.data.map((item) => `${item.name}(${item.weight})`).join(',');
          this.analysisData(this.type, 2, analysisText, this.date_time);
        })
        .catch(() => {
          this.answering = false;
          uni.hideLoading();
        });
    }
  },

  computed: {
    foodComponentInfo() {
      return (foodList) => {
        let calorie = 0;
        let carbohydrate = 0;
        let protein = 0;
        let fat = 0;

        foodList.forEach((item) => {
          calorie += item.calorie;
          carbohydrate += item.carbohydrate;
          protein += item.protein;
          fat += item.fat;
        });

        let total = carbohydrate + protein + fat;

        let carbohydrateR = ((carbohydrate / total) * 100).toFixed(2);
        let proteinR = ((protein / total) * 100).toFixed(2);
        let fatR = ((fat / total) * 100).toFixed(2);

        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.option.series[0].data = [
          { name: '', value: carbohydrateR },
          { name: '', value: proteinR },
          { name: '', value: fatR },
        ];

        return {
          calorie,
          carbohydrate: carbohydrate.toFixed(2),
          protein: protein.toFixed(2),
          fat: fat.toFixed(2),
          carbohydrateR,
          proteinR,
          fatR,
        };
      };
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
    analysisData(type, input_type, analysisText, date_time) {
      setTimeout(() => {
        this.answering = true;

        uni.showLoading({
          title: '正在分析...',
          mask: true,
        });
      });

      $http
        .post(
          'api/diet-info/food-analysis',
          {
            text: analysisText,
            input_type: input_type,
            type: type,
            date_time: date_time,
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          // 未检测到食物，返回上一级
          if (res.data && !res.data.length) {
            this.chatList.push({
              id: Math.random().toString(),
              role: 2,
              content: this.$towxml('未检出到食物，请重新输入', 'markdown'),
              img: '',
            });

            return;
          }

          this.chatList.push({
            id: Math.random().toString(),
            role: 3,
            content: '',
            img: '',
            foodList: res.data,
            type,
            input_type,
            analysisText,
            date_time,
            hasSave: false,
          });
        })
        .catch((error) => {
          this.chatList.push({
            id: Math.random().toString(),
            role: 2,
            content: this.$towxml(error.Msg || error.msg, 'markdown'),
            img: '',
          });
        })
        .finally(() => {
          this.answering = false;
          uni.hideLoading();
        });
    },

    getAnalysisData(item) {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/meal-report',
          {
            type: item.type,
            date_time: item.date_time,
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          uni.hideLoading();
          this.analysisData = res.data;
          item.hasSave = true;

          this.evaluationList = res.data.evaluation.split('\n').map((item) => {
            return {
              title: item.slice(0, 3),
              content: item.slice(3),
            };
          });

          this.chatList.push({
            id: Math.random().toString(),
            role: 4,
            content: '',
            img: '',
            evaluationList: this.evaluationList.slice(0, 2),
          });

          setTimeout(() => {
            this.chatList.push({
              id: Math.random().toString(),
              role: 5,
              content: '',
              img: '',
              evaluationList: this.evaluationList.slice(2),
            });
          });
        });
    },

    saveAndAnalysis(item) {
      if (this.answering) {
        uni.showToast({
          title: '分析未完成',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '操作中...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/create-batch',
          {
            food_batch: item.foodList,
          },
          {
            timeout: 90000,
          },
        )
        .then(() => {
          this.getAnalysisData(item);
        });
    },

    sendMessage() {
      verifyIsLogin();

      if (this.answering) {
        return;
      }

      if (!this.questionText) {
        uni.showToast({
          title: '问题不能为空',
          icon: 'none',
        });

        return;
      }

      this.answering = true;

      this.chatList.push({
        id: Math.random().toString(),
        role: 1,
        content: this.questionText,
        img: '',
      });

      let answerObj = {
        id: Math.random().toString(),
        role: 2,
        content: this.$towxml(this.thinkText, 'markdown'),
      };

      this.chatList.push(answerObj);

      this.$nextTick(() => {
        this.scrollTop += 1;
      });

      // TODO
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
.ai-chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(181deg, #e8f480 0%, #ffffff 41.56%);

  .page-title {
  }

  .banner {
    flex-shrink: 0;
    padding: calc(var(--page-title-height)) 0 0;
  }

  .chat-box {
    padding: 60rpx 48rpx 50rpx;
    flex-grow: 1;
    overflow: auto;

    .chat-list {
      display: flex;
      flex-direction: column;
      gap: 43rpx;

      .chat-item {
        max-width: 90%;
        white-space: wrap;
        word-break: break-word;
        line-height: 40rpx;
        font-size: 26rpx;

        &.question {
          padding: 20rpx 20rpx;
          background: #dad2ff;
          border-radius: 40rpx 0 40rpx 40rpx;
          font-size: 24rpx;
          color: #000000;
          align-self: flex-end;

          image {
            width: 120rpx;
            border-radius: 8rpx;
          }
        }

        &.answer {
          padding: 0 24rpx;
          min-width: 50%;
          background: #e8f480;
          border-radius: 0 40rpx 40rpx 40rpx;
          font-size: 24rpx;
          color: #000000;
          align-self: flex-start;
        }

        &.foodListBox {
          max-width: 100%;
          background: #f3f3f3;
          padding: 20rpx;
          border-radius: 40rpx;

          .food-list-wrap {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .food-container {
              align-self: stretch;
              background: #ffffff;
              border-radius: 20rpx;
              padding: 20rpx;
              margin-bottom: 22rpx;

              .title {
                font-size: 24rpx;
                color: #604fa6;
                display: flex;
                align-items: center;
                gap: 20rpx;
                padding-bottom: 4rpx;

                text {
                  border-bottom: 2rpx solid #323131;
                }
              }

              .total {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                font-size: 20rpx;
                color: #323131;
                margin-bottom: 20rpx;
              }

              .food-list {
                display: flex;
                flex-direction: column;
                gap: 12rpx;

                .food-item {
                  display: flex;
                  align-items: center;
                  font-size: 24rpx;
                  color: #323131;

                  .middle {
                    flex-grow: 1;
                  }
                }
              }
            }

            .save {
              width: 480rpx;
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

          .add-food {
            font-weight: 500;
            font-size: 28rpx;
            color: #0abf92;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10rpx;
          }
        }

        &.evaluationList {
          max-width: 100%;
          background: #f3f3f3;
          padding: 20rpx;
          border-radius: 40rpx;
          display: flex;

          .evaluation-list {
            display: flex;
            flex-direction: column;
            gap: 20rpx;
            background: #ffffff;
            border-radius: 20rpx;
            padding: 20rpx;

            .evaluation-item {
              display: flex;
              flex-direction: column;

              .title {
                font-size: 24rpx;
                color: #604fa6;
                margin-bottom: 12rpx;
              }

              .content {
                font-size: 24rpx;
                color: #323131;
                line-height: 32rpx;
              }
            }
          }
        }

        &.evaluationList2 {
          padding: 0 24rpx;
          min-width: 50%;
          background: #e8f480;
          border-radius: 0 40rpx 40rpx 40rpx;
          font-size: 24rpx;
          color: #000000;
          align-self: flex-start;

          .evaluation-list2 {
          }
        }
      }
    }
  }

  .message-box {
    flex-shrink: 0;
    box-shadow: 0rpx -8rpx 43rpx 0rpx rgba(0, 0, 0, 0.25);
    padding: 0 30rpx 10rpx;
    height: 160rpx;
    background: #ffffff;
    display: flex;
    align-items: center;
    position: relative;

    .ai-tip {
      position: absolute;
      top: 6rpx;
      left: 48rpx;
      right: 0;
      font-size: 16rpx;
      color: #323131;
    }

    .input-box {
      flex-grow: 1;
      height: 60rpx;
      padding: 0 30rpx;
      background: #e7e6e8;
      border-radius: 60rpx;
      display: flex;
      align-items: center;
      margin-right: 14rpx;

      image {
        width: 32rpx;
        margin-right: 14rpx;
      }

      input {
        flex-grow: 1;
        font-size: 26rpx;
      }
    }

    .send {
      flex-shrink: 0;
      width: 160rpx;
      height: 60rpx;
      background: #dad2ff;
      border-radius: 60rpx;
      font-weight: 600;
      font-size: 24rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        background: #aaaaaa;
        color: #ffffff;
      }
    }
  }
}
</style>
