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
          <view @click="jumpAi(aiChartList[1])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg03.png"
            />
            <text>配料表查询</text>
          </view>

          <view @click="jumpAi(aiChartList[3])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg04.png"
            />
            <text>快速消食运动</text>
          </view>
        </view>

        <view class="ai-items2">
          <view @click="jumpAi(aiChartList[2])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg05.png"
            />
            <text>BMI计算</text>
          </view>

          <view @click="jumpAi(aiChartList[4])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg06.png"
            />
            <text>BMR计算</text>
          </view>

          <view @click="jumpAi(aiChartList[5])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg07.png"
            />
            <text>热量计算</text>
          </view>

          <view @click="jumpAi(aiChartList[6])">
            <image
              mode="widthFix"
              src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg08.png"
            />
            <text>热量缺口测算</text>
          </view>
        </view>
      </view>

      <view class="ai-box2" @click="jumpAi(aiChartList[7])">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg09.png" />
        <view class="content">
          <text>AI健身教练</text>
          <text>为你量身定制个性化的健身计划，并为你推荐运动教程</text>
        </view>
      </view>
    </view>

    <view class="part2">
      <view class="ai-food" v-if="isVip" @click="markAIRecipes">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/bg11.png" />

        <view class="content">
          <text>AI定制食谱</text>
          <text>开启AI定制</text>
          <text>为你量身定制个性化的食品计划</text>
        </view>

        <view class="time" v-if="currentRecipesDetail.id && !currentRecipesDetail.template_id">
          <text>Day</text>
          <text>{{ currentRecipesDetail.useDay }}</text>
          <text>/{{ currentRecipesDetail.day }}</text>
        </view>
      </view>

      <view class="lock" v-else @click="goVip">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/AIAssistant/lock.png" />
        <text>会员解锁AI定制食谱</text>
      </view>

      <view class="recipes-list">
        <view class="recipes-item" v-for="item of recipesList" :key="item.id" @click="goRecipesDetailPage(item.id)">
          <image mode="widthFix" :src="item.image" />
          <text>{{ item.name_des }}</text>
        </view>
      </view>

      <view class="no-more">暂无更多</view>
    </view>

    <markAIRecipesDialog ref="markAIRecipesDialog" />

    <custom-tab-bar />
  </view>
</template>

<script>
import $http from '@/utils/http';
import { mapActions, mapGetters, mapState } from 'vuex';
import { verifyIsLogin } from '@/utils';
import MarkAIRecipesDialog from '@/pages/AIAssistant/markAIRecipesDialog.vue';

export default {
  name: 'AIAssistant',

  components: {
    MarkAIRecipesDialog,
  },

  data() {
    return {
      aiChartList: [],
      recipesList: [],
      currentRecipesDetail: {},
      homeWeightPlanData: null,
    };
  },

  computed: {
    ...mapGetters('app', ['isVip']),
    ...mapState('app', ['userDetailInfo']),
  },

  onLoad() {
    this.getRecipesList();
    this.getAiChartList();
  },

  onShow() {
    this._getUserDetailInfo();
    this.getHomeWeightPlan();
    this.getCurrentRecipesDetail();
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    getHomeWeightPlan() {
      return $http.get('api/diet-info/weight-plan/home').then((res) => {
        this.homeWeightPlanData = res.data;
      });
    },

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

    getRecipesList() {
      $http.get('api/diet-info/template-summary').then((res) => {
        this.recipesList = res.data;
      });
    },

    getCurrentRecipesDetail() {
      return $http.post('api/diet-info/recipes-summarys-info').then((res) => {
        res.data.useDay = Math.ceil(
          (new Date() - new Date(res.data.begin_date.replace(/-/g, '/'))) / (24 * 60 * 60 * 1000),
        );
        this.currentRecipesDetail = res.data;
      });
    },

    goRecipesDetailPage(id) {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
        this.$toRouter('/pages/addPlan/addPlan');
        return;
      }

      this.$toRouter('/pages/recipesDetail/recipesDetail', `id=${id}`);
    },

    goVip() {
      verifyIsLogin();
      this.$toRouter('/pages/vip/vip');
    },

    /**
     * 跳转 AI 搭子聊天界面
     */
    jumpAi(item) {
      if (item.id === 10000) {
        this.$toRouter('/pages/healthAssistant/healthAssistant', `agent_id=${item.id}&name=${item.name}`);
        return;
      }

      this.$toRouter('/pages/aiChat/aiChat', `agent_id=${item.id}&name=${item.name}`);
    },

    markAIRecipes() {
      verifyIsLogin();

      if (!this.userDetailInfo) {
        this.$toRouter('/pages/evaluation/evaluation');
        return;
      }

      if (!this.homeWeightPlanData || this.homeWeightPlanData.state !== 1) {
        this.$toRouter('/pages/addPlan/addPlan');
        return;
      }

      if (this.currentRecipesDetail.id) {
        if (this.currentRecipesDetail.template_id) {
          uni.showModal({
            title: '温馨提示',
            content: '您当前已经生成免费食谱，如需定制AI食谱，需要终止之前的食谱，是否前往食谱详情页？',
            success: (res) => {
              if (res.confirm) {
                this.$toRouter('/pages/recipesDetail/recipesDetail', `id=${this.currentRecipesDetail.template_id}`);
              }
            },
          });
        } else {
          uni.showLoading({
            title: '加载中...',
            mask: true,
          });

          this.getCurrentRecipesDetail().then(() => {
            uni.hideLoading();

            if (!this.currentRecipesDetail.recipes_list || !this.currentRecipesDetail.recipes_list.length) {
              uni.showModal({
                title: '温馨提示',
                content: 'AI食谱正在生成中，需要几分钟时间，请稍后刷新页面查看',
                showCancel: false,
              });

              return;
            }

            this.$toRouter('/pages/customizedRecipes/customizedRecipes');
          });
        }
      } else {
        this.$refs.markAIRecipesDialog.open();
      }
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

      .time {
        position: absolute;
        right: 48rpx;
        bottom: 38rpx;
        display: flex;
        align-items: center;

        text {
          font-weight: 600;
          font-size: 32rpx;
          color: #323131;

          &:nth-child(2) {
            font-size: 80rpx;
            position: relative;
            top: -20rpx;
          }
        }
      }
    }

    .lock {
      position: relative;
      margin-bottom: 20rpx;

      image {
        width: 100%;
      }

      text {
        position: absolute;
        left: 0;
        right: 0;
        top: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #000000;
        font-weight: 600;
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
