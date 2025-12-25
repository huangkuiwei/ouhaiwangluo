<template>
  <view class="health-tree">
    <view class="page-title">健康树</view>

    <view class="banner"></view>

    <view class="left">
      <view class="cur-height">
        <text>当前高度：</text>
        <text>{{ accountInfo.tree_height || 0 }}厘米</text>
      </view>

      <view class="history-height">
        <text>当前高度：</text>
        <text>{{ accountInfo.tree_history_height || 0 }}厘米</text>
      </view>

      <view class="icon1" @click="fertilize">
        <image mode="widthFix" src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/icon01.png" />
        <text class="number">x{{ accountInfo.points || 0 }}</text>
        <text class="name">施肥</text>
      </view>

      <view class="icon2">
        <image
          @click="openRecodeDialog"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/icon02.png"
        />

        <text class="name">记录</text>
      </view>
    </view>

    <view class="right">
      <view class="icon3">
        <image
          @click="openExchangeDialog"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/icon03.png"
        />

        <text class="name">收获</text>
      </view>

      <view class="icon4">
        <image
          @click="openRuleDialog"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/icon04.png"
        />

        <text class="name">规则</text>
      </view>
    </view>

    <view class="tip-dialog" v-if="showTip">
      <text>{{ tipList[showTipIndex] }}</text>
    </view>

    <view class="tree-box">
      <view class="tree" :style="{ bottom: treeInfo.bottom + 'rpx', zIndex: treeInfo.zIndex }">
        <image
          class="tree-icon"
          :style="{ width: treeInfo.widthProportion * 100 + '%' }"
          mode="widthFix"
          :src="treeInfo.url"
        />
      </view>

      <view class="soil">
        <image
          class="soil-icon"
          mode="widthFix"
          src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/bg03.png"
        />
      </view>
    </view>

    <view class="fertilizer-box">
      <image
        class="bg"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/bg02.png"
      />

      <view class="fertilizer">
        <view class="title">签到领化肥</view>

        <view class="fertilizer-list">
          <view class="fertilizer-item" v-for="item of signInDayList" :key="item.index">
            <image mode="widthFix" :src="item.signIn ? item.signedImg : item.img" />

            <text>第{{ item.index }}天</text>
          </view>
        </view>

        <view class="sign" @click="signIn" :class="{ 'has-sign-in': hasSignIn }">{{
          hasSignIn ? '已签到' : '立即签到'
        }}</view>
      </view>
    </view>

    <rule-dialog ref="ruleDialog" />
    <recode-dialog ref="recodeDialog" />
    <exchange-dialog ref="exchangeDialog" @openExchangeRecodeDialog="openExchangeRecodeDialog" />
    <exchange-recode-dialog ref="exchangeRecodeDialog" @back="openExchangeDialog" />

    <custom-tab-bar />
  </view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import $http from '@/utils/http';
import { verifyIsLogin } from '@/utils';
import RuleDialog from '@/pages/healthTree/ruleDialog.vue';
import RecodeDialog from '@/pages/healthTree/recodeDialog.vue';
import ExchangeDialog from '@/pages/healthTree/exchangeDialog.vue';
import ExchangeRecodeDialog from '@/pages/healthTree/exchangeRecodeDialog.vue';

export default {
  name: 'healthTree',

  components: {
    ExchangeRecodeDialog,
    ExchangeDialog,
    RecodeDialog,
    RuleDialog,
  },

  data() {
    return {
      accountInfo: {},
      signInDayList: [
        {
          index: 1,
          signIn: false,
          points: 1,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon.png',
        },
        {
          index: 2,
          signIn: false,
          points: 1,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon.png',
        },
        {
          index: 3,
          signIn: false,
          points: 2,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon2.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon2.png',
        },
        {
          index: 4,
          signIn: false,
          points: 1,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon1.png',
        },
        {
          index: 5,
          signIn: false,
          points: 1,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon.png',
        },
        {
          index: 6,
          signIn: false,
          points: 2,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon2.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon2.png',
        },
        {
          index: 7,
          signIn: false,
          points: 1,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon.png',
        },
        {
          index: 8,
          signIn: false,
          points: 3,
          img: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer-icon3.png',
          signedImg: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/fertilizer1-icon3.png',
        },
      ],
      tipList: [
        '你知道吗？运动后肌肉酸痛，多是因为肌纤维微小损伤。适当补充蛋白质+充分休息，反而能让肌肉更强壮哦！',
        '菠菜豆腐一起吃会得结石？菠菜的草酸与豆腐的钙结合，会在肠道形成不被吸收的草酸钙，反而减少了结石风险！',
        '螃蟹和柿子同食会中毒？古人担忧的是单宁与蛋白质结合影响消化。只要两者都新鲜、不过量，常人同时吃无大碍。',
        '豆浆和鸡蛋不能同吃？前提是豆浆必须彻底煮沸，否则其中胰蛋白酶抑制剂会影响蛋白质吸收。煮沸后，放心搭配。',
        '虾和维生素C同食等于砒霜？需要一次性吃下几百斤虾并摄入大量VC，才可能达到中毒剂量。正常饮食完全无需担心。',
        '牛奶和橘子一起吃会影响消化？对于健康人，胃酸足以应对这种组合。但乳糖不耐受或肠胃极敏感的人，分开吃更舒适。',
        '白萝卜和胡萝卜同吃破坏维生素C？胡萝卜中的抗坏血酸氧化酶确实会破坏VC，但加热烹调会使其失活，不必过分纠结。',
        '牛肉和栗子同食会引起呕吐？这更多与食用过量、不易消化有关，而非食物相克。任何食物都应适量，细嚼慢咽。',
        '蜂蜜和洋葱同食伤眼睛？没有科学证据支持。两者都是健康食材，但蜂蜜不建议给一岁以下婴儿食用。',
        '西瓜和羊肉同食“伤元气”？从营养学看毫无根据。可能是中医性味理论的延伸，现代饮食中罕见此搭配。',
        '豆腐和蜂蜜同食导致耳聋？堪称最离谱的传言之一，毫无科学依据。两者都是安全食品，但蜂蜜不建议高温烹煮。',
        '喝骨头汤补钙？其实汤里多是脂肪和嘌呤，钙含量极少。补钙高手是牛奶、豆制品和绿叶蔬菜。',
        '“趁热吃”可能伤食管！国际癌症研究机构指出，超过65℃的热饮有致癌风险。晾一晾，更健康。',
        '果汁≠水果！榨汁过程损失了宝贵的膳食纤维，却浓缩了糖分。想获取完整营养，还是直接吃水果更好。',
        '“喝粥养胃”因人而异。对于胃酸过多或反流的人，稀粥可能加重不适。胃不舒服，最好先明确原因。',
        '晚上吃苹果是“毒苹果”？没有科学依据！任何时间吃苹果都能获得营养。控制总热量才是关键。',
        '食物相克不科学？但“食物与药物相克”真实存在！服他汀类降脂药别吃西柚，服降压药期间慎用甘草。',
        '爱吃烧烤？当心“苯并芘”这类致癌物。用锡纸包裹食材、避免明火直烤、搭配绿叶蔬菜一起吃能降低风险。',
        '自制“养生茶”别乱配！比如决明子长期喝可能腹泻，甘草多用易致水肿。中药代茶饮，最好咨询中医师。',
        '喝酸奶主要喝的是“乳酸菌”及其代谢产物。选择冷藏、日期新鲜的酸奶，活菌数更有保障。',
        '“超级食物”如奇亚籽、牛油果，营养虽好但不宜神话。均衡饮食，五谷杂粮、家常菜肴才是健康基石。',
        '空腹运动燃脂快？当心低血糖和肌肉流失！建议运动前1小时吃点香蕉、全麦面包，提供稳定能量。',
        '“仰卧起坐”练腹肌可能伤腰！更推荐“卷腹”或“平板支撑”，它们能更好地孤立腹部肌肉，保护脊柱。',
        '运动时口渴再喝水就晚了！建议每15-20分钟补充150-200ml水分，小口慢饮，保持身体水分平衡。',
        '跑步机比户外跑更轻松？因为跑步带提供了助力。想增加强度，可尝试1-2%的坡度模拟户外阻力。',
        '运动后马上洗澡？小心头晕或供血不足！建议休息30分钟，待心率平稳、汗液稍干后再进行温水淋浴。',
        '力量训练不是男生专利！女生适当举铁，能高效提升代谢、塑造线条，且很难练出夸张肌肉，请放心。',
        '运动抽筋不一定是缺钙！可能是电解质流失或肌肉疲劳。运动前充分热身，及时补充含钾、钠的食物或饮品。',
        '“暴汗服”减掉的主要是水分，不是脂肪。长期使用可能引起脱水或中暑。健康减脂，还需科学运动与饮食结合。',
        '运动效果有“滞后性”，今天的努力可能下周才体现在体测数据上。请保持耐心，坚持记录，身体不会辜负你！',
        '你知道吗？运动后肌肉酸痛，多是因为肌纤维微小损伤。适当补充蛋白质+充分休息，反而能让肌肉更强壮哦！',
      ],
      showTipIndex: 0,
      showTip: false,
    };
  },

  computed: {
    ...mapState('app', ['userDetailInfo']),
    ...mapGetters('app', ['isLogin']),

    hasSignIn() {
      if (this.accountInfo.last_sign_date) {
        return new Date().format().slice(0, 10) === new Date(this.accountInfo.last_sign_date).format().slice(0, 10);
      }

      return false;
    },

    // TODO 7个等级判定
    treeInfo() {
      if (this.accountInfo.tree_level === 7) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree07.png',
          widthProportion: 1,
          bottom: 0,
          zIndex: 1,
        };
      } else if (this.accountInfo.tree_level === 6) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree06.png',
          widthProportion: 1,
          bottom: 40,
          zIndex: 1,
        };
      } else if (this.accountInfo.tree_level === 5) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree05.png',
          widthProportion: 682 / 750,
          bottom: 0,
          zIndex: 1,
        };
      } else if (this.accountInfo.tree_level === 4) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree04.png',
          widthProportion: 246 / 750,
          bottom: 40,
          zIndex: 1,
        };
      } else if (this.accountInfo.tree_level === 3) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree03.png',
          widthProportion: 184 / 750,
          bottom: 40,
          zIndex: 1,
        };
      } else if (this.accountInfo.tree_level === 2) {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree02.png',
          widthProportion: 142 / 750,
          bottom: 40,
          zIndex: 1,
        };
      } else {
        return {
          url: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/tree01.png',
          widthProportion: 100 / 750,
          bottom: 40,
          zIndex: 3,
        };
      }
    },
  },

  onShow() {
    this.initData(true);
    this._getUserDetailInfo();
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/share-img.jpg',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserDetailInfo']),

    async initData(showToast) {
      if (showToast) {
        uni.showLoading({
          title: '加载中...',
          mask: true,
        });
      }

      await this.getAccountInfo().catch(() => {});

      if (showToast) {
        uni.hideLoading();
      }
    },

    getAccountInfo() {
      return $http.get('api/health-tree/account-info').then((res) => {
        this.accountInfo = res.data;

        if (this.accountInfo.sign_continuous_days > 0) {
          this.signInDayList.forEach((item, index) => {
            item.signIn = index < this.accountInfo.sign_continuous_days;
          });
        }
      });
    },

    signIn() {
      verifyIsLogin();

      if (this.hasSignIn) {
        return;
      }

      uni.showLoading({
        title: '签到中...',
        mask: true,
      });

      $http.get('api/health-tree/sign-in').then((res) => {
        uni.hideLoading();

        uni.showToast({
          title: `签到成功，获取${res.data.points}袋化肥`,
          icon: 'none',
        });

        this.initData();
      });
    },

    showTipDialog() {
      if (!this.showTip) {
        this.showTipIndex = Math.floor(Math.random() * this.tipList.length);
        this.showTip = true;
      }
    },

    openRuleDialog() {
      this.$refs.ruleDialog.open();
    },

    openRecodeDialog() {
      verifyIsLogin();
      this.$refs.recodeDialog.open();
    },

    openExchangeDialog() {
      verifyIsLogin();
      this.$refs.exchangeDialog.open();
    },

    openExchangeRecodeDialog() {
      this.$refs.exchangeRecodeDialog.open();
    },

    fertilize() {
      verifyIsLogin();

      uni.showLoading({
        title: '施肥中...',
        mask: true,
      });

      // TODO 接口404
      $http.get('api/health-tree/fertilize').then((res) => {
        uni.hideLoading();

        uni.showToast({
          title: `施肥成功，小树增高${res.data.height}厘米`,
          icon: 'none',
        });

        this.initData();
        this.showTipDialog();

        setTimeout(() => {
          this.showTip = false;
        }, 5000);
      });
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
.health-tree {
  height: 100%;
  overflow: hidden;
  background: url('https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/healthTree/bg.png') left top/100% 100%
    no-repeat;

  .page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 0;
  }

  .left {
    position: absolute;
    left: 24rpx;
    top: calc(var(--page-title-height) + 8rpx);
    display: flex;
    flex-direction: column;
    z-index: 99;

    .cur-height {
      width: 260rpx;
      padding: 12rpx;
      background: #e8f480;
      border-radius: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4rpx;
      margin-bottom: 14rpx;

      text {
        &:nth-child(1) {
          font-size: 28rpx;
          color: #323131;
        }

        &:nth-child(2) {
          font-size: 32rpx;
          color: #323131;
        }
      }
    }

    .history-height {
      width: 212rpx;
      padding: 6rpx 12rpx;
      background: #f3f3f3;
      border-radius: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4rpx;
      margin-bottom: 44rpx;

      text {
        font-size: 24rpx;
        color: #514f53;
      }
    }

    .icon1 {
      width: 120rpx;
      margin-bottom: 30rpx;
      position: relative;

      image {
        width: 100%;
      }

      .number {
        position: absolute;
        right: 4rpx;
        top: 4rpx;
        font-size: 32rpx;
        color: #323131;
      }

      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 14rpx;
        text-align: center;
        font-size: 20rpx;
        color: #323131;
      }
    }

    .icon2 {
      width: 120rpx;
      position: relative;

      image {
        width: 100%;
      }

      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 14rpx;
        text-align: center;
        font-size: 20rpx;
        color: #323131;
      }
    }
  }

  .right {
    position: absolute;
    right: 24rpx;
    top: calc(var(--page-title-height) + 88rpx);
    display: flex;
    flex-direction: column;
    z-index: 99;

    .icon3 {
      width: 120rpx;
      margin-bottom: 30rpx;
      position: relative;

      image {
        width: 100%;
      }

      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 14rpx;
        text-align: center;
        font-size: 20rpx;
        color: #323131;
      }
    }

    .icon4 {
      width: 120rpx;
      position: relative;

      image {
        width: 100%;
      }

      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 14rpx;
        text-align: center;
        font-size: 20rpx;
        color: #323131;
      }
    }
  }

  .tip-dialog {
    position: absolute;
    top: 650rpx;
    right: 40rpx;
    width: 320rpx;
    background: #ffffff;
    border-radius: 40rpx;
    border: 4rpx solid #e8f480;
    padding: 18rpx 20rpx;
    font-size: 20rpx;
    color: #000000;
    line-height: 28rpx;
    z-index: 999;
  }

  .tree-box {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 530rpx;

    .tree {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
    }

    .soil {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 2;

      .soil-icon {
        width: 100%;
      }
    }
  }

  .fertilizer-box {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 127rpx;
    z-index: 9;

    .bg {
      width: 100%;
    }

    .fertilizer {
      position: absolute;
      left: 0;
      right: 0;
      top: 30rpx;
      bottom: 0;

      .title {
        font-weight: 600;
        font-size: 28rpx;
        color: #323131;
        padding-left: 42rpx;
        margin-bottom: 44rpx;
      }

      .fertilizer-list {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10rpx;

        .fertilizer-item {
          width: 25%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8rpx;
          margin-bottom: 14rpx;

          image {
            width: 100rpx;
          }

          text {
            font-size: 20rpx;
            color: #323131;
          }
        }
      }

      .sign {
        width: 400rpx;
        margin: 0 auto;
        height: 60rpx;
        background: #dad2ff;
        border-radius: 60rpx;
        font-weight: 600;
        font-size: 24rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;

        &.has-sign-in {
          background: #f3f3f3;
        }
      }
    }
  }
}
</style>
