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
              <view class="title">
                <picker
                  mode="date"
                  @change="onDateChange($event, item)"
                  :value="item.date_time"
                  :disabled="item.hasSave"
                >
                  <text>{{ item.date_time.slice(5, 10) }}</text>
                </picker>

                <picker
                  @change="onMealChange($event, item)"
                  :value="item.type"
                  range-key="text"
                  :range="foodTypeList"
                  :disabled="item.hasSave"
                >
                  <text>{{ foodTypeList[item.type].text }}</text>
                </picker>
              </view>

              <view class="total">{{ foodComponentInfo(item.foodList).calorie }}千卡</view>

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
            <view class="appraisal">
              <text>饮食评价：</text>

              <text v-if="foodComponentInfo(item.foodList).calorie > calorieAnalysis(item.type).max">吃多了</text>
              <text
                v-else-if="
                  foodComponentInfo(item.foodList).calorie <= calorieAnalysis(item.type).max &&
                  foodComponentInfo(item.foodList).calorie >= calorieAnalysis(item.type).min
                "
              >
                合适
              </text>
              <text v-else>吃少了</text>
            </view>

            <view class="weight"
              >根据您的BMI（{{
                (userDetailInfo.current_weight / ((userDetailInfo.height * userDetailInfo.height) / 10000)).toFixed(2)
              }}）和当前体重（{{ userDetailInfo.current_weight }}千克）</view
            >

            <view class="suggest" v-if="item.evaluationList">
              <text>优化建议：</text>
              <text>{{ item.evaluationList[0].content }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="icon" @click="selectImage">
      <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/foodRecord/icon01.png" />
    </view>

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
import { mapState } from 'vuex';

export default {
  name: 'aiChat',

  data() {
    return {
      type: 0,
      aiName: '饮食速记',
      scrollTop: 99999,
      chatList: [],
      questionText: '',
      answering: false,
      thinkText: '正在思考，请稍等...',
      date_time: new Date().format().replace(/\//g, '-').slice(0, 10),
      evaluationList: [],
      dailyCalorie: {},
      foodTypeList: [
        {
          type: 1,
          text: '早餐',
        },
        {
          type: 2,
          text: '早加餐',
        },
        {
          type: 3,
          text: '午餐',
        },
        {
          type: 4,
          text: '午加餐',
        },
        {
          type: 5,
          text: '晚餐',
        },
        {
          type: 6,
          text: '晚加餐',
        },
      ],
    };
  },

  onLoad(options) {
    this.getDailyCalorie(this.date_time);

    // type 默认从0开始，0 => 早餐
    if (options.type) {
      this.type = Number(options.type) - 1;
    } else {
      // 根据当前时间推断餐饮类型
      let time = new Date().format().slice(-8, -6);

      if (time >= 7 && time <= 9) {
        this.type = 0;
      } else if (time >= 9 && time <= 11) {
        this.type = 1;
      } else if (time >= 11 && time <= 14) {
        this.type = 2;
      } else if (time >= 14 && time <= 17) {
        this.type = 3;
      } else if (time >= 17 && time <= 19) {
        this.type = 4;
      } else if (time >= 19 && time <= 21) {
        this.type = 5;
      } else {
        this.type = 6;
      }
    }

    if (options.date_time) {
      this.date_time = decodeURIComponent(options.date_time);
    }

    if (options.type && options.date_time) {
      uni.showLoading({
        title: '正在分析...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/meal-report',
          {
            type: this.type + 1,
            date_time: this.date_time,
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          uni.hideLoading();

          this.evaluationList = res.data.evaluation.split('\n').map((item) => {
            return {
              title: item.slice(0, 3),
              content: item.slice(3),
            };
          });

          this.chatList.push({
            id: Math.random().toString(),
            role: 3,
            content: '',
            img: '',
            foodList: res.data.die_list,
            type: this.type,
            input_type: 1,
            analysisText: '',
            date_time: this.date_time,
            hasSave: true,
          });

          this.chatList.push({
            id: Math.random().toString(),
            role: 4,
            content: '',
            img: '',
            evaluationList: this.evaluationList.slice(0, 2),
            foodList: res.data.die_list,
          });

          this.chatList.push({
            id: Math.random().toString(),
            role: 5,
            content: '',
            img: '',
            evaluationList: this.evaluationList.slice(2),
            foodList: res.data.die_list,
          });

          this.$nextTick(() => {
            this.scrollTop += 1;
          });
        });
    }

    this.chatList = [
      {
        id: Math.random().toString(),
        role: 2,
        content: this.$towxml(
          '你好，我可以快速为你记录饮食，描述的越清晰，数据记录越准确。\n' +
            '你可以这样问说：\n' +
            '“今天早上吃了两个肉包子”\n' +
            '“今天中午吃了香干炒肉，一碗混沌”\n',
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
      this.uploadImgAndAna(decodeURIComponent(options.url));
    }
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),

    foodComponentInfo() {
      return (foodList) => {
        let calorie = 0;

        foodList.forEach((item) => {
          calorie += item.calorie;
        });

        return {
          calorie,
        };
      };
    },

    calorieAnalysis() {
      return (type) => {
        let min = 0;
        let max = 0;
        type = Number(type) + 1;
        let total = this.dailyCalorie.calorie_requirement;

        if (type === 1) {
          min = 0.25;
          max = 0.3;
        } else if (type === 2) {
          min = 0.05;
          max = 0.1;
        } else if (type === 3) {
          min = 0.3;
          max = 0.35;
        } else if (type === 4) {
          min = 0.05;
          max = 0.1;
        } else if (type === 5) {
          min = 0.25;
          max = 0.3;
        } else if (type === 6) {
          min = 0.05;
          max = 0.1;
        }

        return {
          min: Math.round(total * min),
          max: Math.round(total * max),
        };
      };
    },
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    uploadImgAndAna(url) {
      this.chatList.push({
        id: Math.random().toString(),
        role: 1,
        content: '',
        img: url,
      });

      this.answering = true;

      uni.showLoading({
        title: '正在分析...',
        mask: true,
      });

      this.$nextTick(() => {
        this.scrollTop += 1;
      });

      $http
        .upload('api/baseai/image-analysis', url, 'image')
        .then((res) => {
          if (res.data && !res.data.length) {
            this.chatList.push({
              id: Math.random().toString(),
              role: 2,
              content: this.$towxml('未检出到食物，请重新输入', 'markdown'),
              img: '',
            });

            this.$nextTick(() => {
              this.scrollTop += 1;
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
    },

    getDailyCalorie(date_time) {
      return $http
        .post('api/diet-info/daily-calorie', {
          date: date_time,
        })
        .then((res) => {
          this.dailyCalorie = res.data;
        });
    },

    onMealChange(event, item) {
      item.type = Number(event.detail.value);
    },

    onDateChange(event, item) {
      item.date_time = event.detail.value;
    },

    selectImage() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          let filePath = res.tempFiles[0].tempFilePath;
          this.uploadImgAndAna(filePath);
        },
      });
    },

    analysisData(type, input_type, analysisText, date_time, addRecode = true) {
      return new Promise((resolve, reject) => {
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
              type: type + 1,
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

            if (addRecode) {
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
            }

            resolve(res);
          })
          .catch((error) => {
            if (addRecode) {
              this.chatList.push({
                id: Math.random().toString(),
                role: 2,
                content: this.$towxml(error.Msg || error.msg, 'markdown'),
                img: '',
              });
            }

            reject(error);
          })
          .finally(() => {
            this.answering = false;
            uni.hideLoading();

            this.$nextTick(() => {
              this.scrollTop += 1;
            });
          });
      });
    },

    async saveAndAnalysis(item) {
      if (this.answering) {
        uni.showToast({
          title: '分析未完成',
          icon: 'none',
        });

        return;
      }

      uni.showLoading({
        title: '正在分析...',
        mask: true,
      });

      this.analysisData(item.type, 1, item.analysisText, item.date_time, false).then((res) => {
        $http
          .post(
            'api/diet-info/create-batch',
            {
              food_batch: res.data,
            },
            {
              timeout: 90000,
            },
          )
          .then(() => {
            this.getAnalysisData(item);
          });
      });
    },

    getAnalysisData(item) {
      uni.showLoading({
        title: '正在分析...',
        mask: true,
      });

      $http
        .post(
          'api/diet-info/meal-report',
          {
            type: item.type + 1,
            date_time: item.date_time,
          },
          {
            timeout: 90000,
          },
        )
        .then((res) => {
          uni.hideLoading();
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
            foodList: item.foodList,
          });

          setTimeout(() => {
            this.chatList.push({
              id: Math.random().toString(),
              role: 5,
              content: '',
              img: '',
              evaluationList: this.evaluationList.slice(2),
              foodList: item.foodList,
            });
          });
        })
        .finally(() => {
          this.$nextTick(() => {
            this.scrollTop += 1;
          });
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

      this.$nextTick(() => {
        this.scrollTop += 1;
      });

      this.analysisData(this.type, 1, this.questionText, this.date_time);
      this.questionText = '';
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
    padding: 50rpx 48rpx 40rpx;
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

            .evaluation-item {
              background: #ffffff;
              border-radius: 20rpx;
              padding: 20rpx;
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
          padding: 20rpx 24rpx;
          min-width: 50%;
          background: #e8f480;
          border-radius: 0 40rpx 40rpx 40rpx;
          font-size: 24rpx;
          color: #000000;
          align-self: flex-start;

          .evaluation-list2 {
            .appraisal,
            .suggest {
              text {
                font-size: 24rpx;
                color: #000000;
                line-height: 32rpx;

                &:nth-child(1) {
                  color: #604fa6;
                }
              }
            }

            .weight {
              line-height: 32rpx;
            }
          }
        }
      }
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20rpx 20rpx;

    image {
      width: 96rpx;
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
