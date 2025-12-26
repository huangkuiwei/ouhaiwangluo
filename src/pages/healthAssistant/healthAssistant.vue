<template>
  <view class="ai-chat-page">
    <view class="page-title">
      <text>{{ aiName }}</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <!--<view class="chat-logo">-->
    <!--  <image-->
    <!--    mode="widthFix"-->
    <!--    src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/healthAssistant/people-icon2.png"-->
    <!--  />-->
    <!--</view>-->

    <scroll-view class="chat-box" :scroll-y="true" :show-scrollbar="false" :scroll-top="scrollTop">
      <view class="chat-list">
        <view
          class="chat-item"
          :class="{ question: item.role === 1, answer: item.role === 2 }"
          v-for="item of chatList"
          :key="item.id"
        >
          <text v-if="item.role === 1">{{ item.content }}</text>
          <towxml v-else :nodes="item.content"></towxml>
        </view>
      </view>
    </scroll-view>

    <!--<view class="question-list">-->
    <!--  <view class="question-item" v-for="item of questionList" :key="item.id" @click="selectQuestion(item)">-->
    <!--    {{ item.text }}-->
    <!--  </view>-->
    <!--</view>-->

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
import $http from '@/utils/http';
import { concatenateArrayBuffers, verifyIsLogin } from '@/utils';

export default {
  name: 'aiChat',

  data() {
    return {
      agent_id: undefined,
      aiName: '',
      scrollTop: 99999,
      questionList: [
        {
          id: 1,
          text: '今日养生指南',
        },
        {
          id: 2,
          text: '中医体质测评',
        },
      ],
      chatList: [],
      questionText: '',
      conversation_id: undefined,
      answering: false,
      thinkText: '正在思考，请稍等...',
    };
  },

  onLoad(options) {
    this.agent_id = options.agent_id;
    this.aiName = decodeURIComponent(options.name);
    this.getHistoryChat();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    getHistoryChat() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/baseai/chat-records', {
          order_type: 1,
          pageIndex: 1,
          pageSize: 20,
          agent_id: this.agent_id,
        })
        .then((res) => {
          uni.hideLoading();

          if (res.data.Items && res.data.Items.length) {
            this.conversation_id = res.data.Items[0].conversation_id;
            this.chatList = res.data.Items.reverse();

            res.data.Items.forEach((item) => {
              if (item.role === 2) {
                item.content = this.$towxml(item.content, 'markdown');
              }
            });
          }

          this.$nextTick(() => {
            this.scrollTop += 1;
          });
        });
    },

    selectQuestion(item) {
      this.questionText = item.text;
      this.sendMessage();
    },

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
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
        id: Math.round().toString(),
        role: 1,
        content: this.questionText,
      });

      let answerObj = {
        id: Math.round().toString(),
        role: 2,
        content: this.$towxml(this.thinkText, 'markdown'),
      };

      this.chatList.push(answerObj);

      this.$nextTick(() => {
        this.scrollTop += 1;
      });

      const requestTask = uni.request({
        url: process.env.VUE_APP_REQUEST_BASE_API_URL + 'api/baseai/agent-chat',
        method: 'POST',
        header: {
          Accept: 'text/event-stream',
          token: uni.getStorageSync('foodDiaryToken').value,
        },
        data: {
          agent_id: this.agent_id,
          message: this.questionText,
          conversation_id: this.conversation_id,
        },
        enableChunked: true,
        responseType: 'arraybuffer',
        success: (res) => {
          console.log('Data received 数据接受完毕:', res.data);
        },
        fail: (error) => {
          console.log('打印***error 错误处理', error);
        },
        complete: (complete) => {
          console.log('打印***complete 完成接收', complete);

          // conversation_id为空的情况下重新获取conversation_id
          if (!this.conversation_id) {
            setTimeout(() => {
              $http
                .post('api/baseai/chat-records', {
                  order_type: 1,
                  pageIndex: 1,
                  pageSize: 20,
                  agent_id: this.agent_id,
                })
                .then((res) => {
                  if (res.data.Items && res.data.Items.length) {
                    this.conversation_id = res.data.Items[0].conversation_id;
                  }
                });
            }, 500);
          }
        },
      });

      let chunkLength = 0;
      let resList = [];

      requestTask.onChunkReceived(async (res) => {
        chunkLength += 1;
        let currentChunk = chunkLength;
        resList.push(res);

        const uint8Array = new Uint8Array(concatenateArrayBuffers(...resList.map((item) => item.data)));
        let text = String.fromCharCode.apply(null, uint8Array);

        try {
          let result = JSON.parse(text);

          if (result.Code) {
            answerObj.content = this.$towxml(result.Msg, 'markdown');

            this.$nextTick(() => {
              this.scrollTop += 1;
            });

            return;
          }
        } catch (e) {}

        const arr = text.split('\n\n').filter(Boolean);
        let content = '';

        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === 'event: end\n' + 'data: {}') {
            break;
          }

          const jsonStr = arr[i].slice(6); // 去掉前缀

          try {
            const data = JSON.parse(jsonStr);
            await this.sleep(20);

            for (let j = 0; j < data.text.length; j++) {
              await this.sleep(20);

              if (currentChunk !== chunkLength) {
                content = '';
                answerObj.content = this.$towxml(content, 'markdown');
                return;
              } else {
                content += data.text[j];
                answerObj.content = this.$towxml(content, 'markdown');
              }

              this.$nextTick(() => {
                this.scrollTop += 1;
              });
            }
          } catch (e) {}
        }

        this.answering = false;
      });

      this.questionText = '';
    },
  },
};
</script>

<style lang="scss">
page {
  height: 100%;
  background: #f6f7fb;
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

  // .chat-logo {
  //   padding: 44rpx 30rpx 0;
  //   flex-shrink: 0;
  //   margin-bottom: 39rpx;
  //
  //   image {
  //     width: 120rpx;
  //   }
  // }

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
      }
    }
  }

  // .question-list {
  //   flex-shrink: 0;
  //   padding: 0 30rpx;
  //   display: flex;
  //   align-items: center;
  //   gap: 20rpx;
  //
  //   .question-item {
  //     height: 65rpx;
  //     padding: 0 20rpx;
  //     background: #ffffff;
  //     border-radius: 33rpx;
  //     font-size: 28rpx;
  //     color: #111111;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     margin-bottom: 20rpx;
  //   }
  // }

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
