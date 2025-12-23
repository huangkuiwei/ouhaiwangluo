<template>
  <view class="AI-assistant">
    <view class="page-title">体重管理</view>

    <view class="banner"></view>

    <view class="part1">
      <view class="ai-box1">
        <image
          class="bg02"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg02.png"
        />

        <view class="ask-ai" @click="jumpAi(aiChartList[0])">问助理</view>

        <view class="ai-items1">
          <view @click="jumpAi(aiChartList[5])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg03.png"
            />
            <text>配料表查询</text>
          </view>

          <!-- TODO 快速消食运动 -->
          <view>
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg04.png"
            />
            <text>快速消食运动</text>
          </view>
        </view>

        <view class="ai-items2">
          <view @click="jumpAi(aiChartList[6])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg05.png"
            />
            <text>BMI计算</text>
          </view>

          <view @click="jumpAi(aiChartList[7])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg06.png"
            />
            <text>BMR计算</text>
          </view>

          <view @click="jumpAi(aiChartList[8])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg07.png"
            />
            <text>热量计算</text>
          </view>

          <view @click="jumpAi(aiChartList[9])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg08.png"
            />
            <text>热量缺口测算</text>
          </view>
        </view>
      </view>

      <view class="ai-box2" @click="jumpAi(aiChartList[4])">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg09.png" />
        <view class="content">
          <text>AI健身教练</text>
          <text>为你量身定制个性化的健身计划，并为你推荐运动教程</text>
        </view>
      </view>
    </view>

    <view class="part2">
      <view class="ai-food" @click="jumpAi(aiChartList[1])">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg11.png" />

        <view class="content">
          <text>AI定制食谱</text>
          <text>开启AI定制</text>
          <text>为你量身定制个性化的食品计划</text>
        </view>
      </view>

      <!-- TODO 食谱列表 -->
      <view class="recipes-list">
        <view class="recipes-item">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/recipes-pic.png"
          />
          <text>高钾排水-3日急救掉秤食谱</text>
        </view>

        <view class="recipes-item">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/recipes-pic.png"
          />
          <text>高钾排水-3日急救掉秤食谱</text>
        </view>

        <view class="recipes-item">
          <image
            mode="widthFix"
            src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/recipes-pic.png"
          />
          <text>高钾排水-3日急救掉秤食谱</text>
        </view>
      </view>

      <view class="no-more">暂无更多</view>
    </view>

    <custom-tab-bar />
  </view>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'AIAssistant',

  data() {
    return {
      aiChartList: [],
    };
  },

  onLoad() {
    this.getAiChartList();
  },

  methods: {
    /**
     * 获取 ai 搭子列表
     */
    getAiChartList() {
      $http
        .get('api/baseai/agent-list')
        .then((res) => {
          this.aiChartList = res.data;
        })
        .catch(() => {
          this.aiChartList = [];
        });
    },

    /**
     * 跳转 AI 搭子聊天界面
     */
    jumpAi(item) {
      // verifyIsLogin();

      if (item.id === 10000) {
        this.$toRouter('/pages/healthAssistant/healthAssistant', `agent_id=${item.id}&name=${item.name}`);
        return;
      }

      this.$toRouter('/pages/aiChat/aiChat', `agent_id=${item.id}&name=${item.name}`);
    },
  },
};
</script>

<style scoped lang="scss">
.AI-assistant {
  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 24rpx;
  }

  .part1 {
    padding: 0 24rpx;
    margin-bottom: 20rpx;

    .ai-box1 {
      padding: 20rpx;
      background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg01.png') left top/100%
        100% no-repeat;
      position: relative;

      .bg02 {
        position: absolute;
        left: 62rpx;
        top: -36rpx;
        width: 228rpx;
      }

      .ask-ai {
        position: absolute;
        left: 18rpx;
        top: 276rpx;
        width: 128rpx;
        height: 44rpx;
        background: #dad2ff;
        border-radius: 40rpx;
        font-weight: 600;
        font-size: 24rpx;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ai-items1 {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 20rpx;
        margin-bottom: 22rpx;

        view {
          position: relative;

          image {
            width: 360rpx;
          }

          text {
            position: absolute;
            top: 20rpx;
            left: 40rpx;
          }
        }
      }

      .ai-items2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        view {
          width: 128rpx;
          position: relative;

          image {
            width: 100%;
          }

          text {
            font-size: 20rpx;
            color: #323131;
            position: absolute;
            left: 0;
            right: 0;
            text-align: center;
            bottom: 12rpx;
          }
        }
      }
    }

    .ai-box2 {
      position: relative;

      image {
        width: 100%;
      }

      .content {
        position: absolute;
        left: 20rpx;
        top: 0;
        bottom: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 28rpx;

        text {
          &:nth-child(1) {
            font-weight: 600;
            font-size: 24rpx;
            color: #000000;
          }

          &:nth-child(2) {
            font-size: 20rpx;
            color: #323131;
          }
        }
      }
    }
  }

  .part2 {
    padding: 30rpx 24rpx 200rpx;
    background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg10.png') left top/100% 100%
      no-repeat;

    .ai-food {
      position: relative;
      margin-bottom: 20rpx;

      image {
        width: 100%;
      }

      .content {
        position: absolute;
        left: 46rpx;
        top: 24rpx;
        display: flex;
        flex-direction: column;

        text {
          font-size: 20rpx;
          color: #323131;

          &:nth-child(1) {
            font-weight: 600;
            font-size: 24rpx;
            color: #000000;
            margin-bottom: 4rpx;
          }

          &:nth-child(2) {
            margin-bottom: 44rpx;
          }
        }
      }
    }

    .recipes-list {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      margin-bottom: 20rpx;

      .recipes-item {
        position: relative;

        image {
          width: 100%;
          border-radius: 20rpx;
          display: block;
        }

        text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 48rpx;
          width: 100%;
          display: flex;
          align-items: center;
          padding-left: 18rpx;
          font-weight: 600;
          font-size: 20rpx;
          color: #ffffff;
          border-radius: 0 0 20rpx 20rpx;
          background: #32313180;
        }
      }
    }

    .no-more {
      text-align: center;
      font-weight: 600;
      font-size: 20rpx;
      color: #323131;
    }
  }
}
</style>
