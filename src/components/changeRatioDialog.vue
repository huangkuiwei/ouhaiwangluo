<template>
  <uni-popup ref="changeRatioPopup" type="bottom" :safe-area="false">
    <view class="change-ratio-dialog">
      <view class="title">
        <text class="title-text">饮食记录</text>
      </view>

      <view class="current">目前使用值：{{ dailyCalorie.calorie_intake || 0 }}千卡</view>
      <view class="tip">修改比例时，将按照热量目标总额来分配营养克重。</view>
      <view class="ratio-box">
        <view class="ratio-box-title">
          <text>每日营养目标</text>
          <text @click="reset">恢复默认</text>
        </view>

        <view class="calorie-type">
          <view class="calorie-item">
            <view class="name">碳水化合物</view>

            <view class="details">
              <view class="value">
                <text>{{ Math.round(dailyCalorie.carbohydrate_requirement || 0) }}克/</text>
                <text>{{ Math.round(dailyCalorie.carbohydrate_ratio || 0) }}%</text>
              </view>
            </view>
          </view>

          <view class="calorie-item">
            <view class="name">蛋白质</view>

            <view class="details">
              <view class="value">
                <text>{{ Math.round(dailyCalorie.protein_requirement || 0) }}克/</text>
                <text>{{ Math.round(dailyCalorie.protein_ratio || 0) }}%</text>
              </view>
            </view>
          </view>

          <view class="calorie-item">
            <view class="name">脂肪</view>

            <view class="details">
              <view class="value">
                <text>{{ Math.round(dailyCalorie.fat_requirement || 0) }}克/</text>
                <text>{{ Math.round(dailyCalorie.fat_ratio || 0) }}%</text>
              </view>
            </view>
          </view>
        </view>

        <view class="ratio-list">
          <view class="ratio-item">
            <view class="ratio-tip">
              <text>碳水化合物</text>
              <text>{{ dailyCalorie.carbohydrate_ratio || 0 }}%</text>
            </view>

            <slider
              :value="dailyCalorie.carbohydrate_ratio"
              activeColor="#78F788"
              backgroundColor="#78F78815"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'carbohydrate_ratio')"
            />
          </view>

          <view class="ratio-item">
            <view class="ratio-tip">
              <text>蛋白质</text>
              <text>{{ dailyCalorie.protein_ratio || 0 }}%</text>
            </view>

            <slider
              :value="dailyCalorie.protein_ratio"
              activeColor="#FF7542"
              backgroundColor="#FF754215"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'protein_ratio')"
            />
          </view>

          <view class="ratio-item">
            <view class="ratio-tip">
              <text>脂肪</text>
              <text>{{ dailyCalorie.fat_ratio || 0 }}%</text>
            </view>

            <slider
              :value="dailyCalorie.fat_ratio"
              activeColor="#FFD78F"
              backgroundColor="#FFD78F15"
              :block-size="20"
              :min="0"
              :max="100"
              :step="1"
              @changing="onRateChanging($event, 'fat_ratio')"
            />
          </view>
        </view>
      </view>

      <view class="submit" @click="submit">确定</view>
    </view>
  </uni-popup>
</template>

<script>
import $http from '@/utils/http';

export default {
  name: 'changeRatioDialog',

  data() {
    return {
      dailyCalorie: {},
    };
  },

  methods: {
    open() {
      uni.showLoading({
        title: '加载中,',
        icon: 'none',
      });

      this.getDailyCalorie();
      this.$refs.changeRatioPopup.open();
    },

    close() {
      this.$refs.changeRatioPopup.close();
    },

    getDailyCalorie() {
      return $http
        .post(
          'api/diet-info/daily-calorie',
          {
            date: new Date().format(),
          },
          {
            hiddenErrorMessage: true,
          },
        )
        .then((res) => {
          // 卡路里总量、剩余量和比例计算
          let total = res.data.calorie_requirement + res.data.calorie_burn;
          let remaining = total - res.data.calorie_intake;
          let ratio = Number(((remaining / total) * 100).toFixed(2));

          if (ratio > 100) {
            ratio = 100;
          } else if (ratio < 0) {
            ratio = 0;
          }

          res.data.ratio = ratio;
          res.data.remaining = remaining < 0 ? 0 : Number(remaining.toFixed(2));

          // 碳水、蛋白质、脂肪剩余量和比例计算
          res.data.remainingA = Number((res.data.carbohydrate_requirement - res.data.carbohydrate_intake).toFixed(2));
          res.data.remainingB = Number((res.data.protein_requirement - res.data.protein_intake).toFixed(2));
          res.data.remainingC = Number((res.data.fat_requirement - res.data.fat_intake).toFixed(2));

          if (res.data.remainingA < 0) {
            res.data.remainingA = 0;
          }

          if (res.data.remainingB < 0) {
            res.data.remainingB = 0;
          }

          if (res.data.remainingC < 0) {
            res.data.remainingC = 0;
          }

          res.data.remainingARatio = (res.data.carbohydrate_intake / res.data.carbohydrate_requirement) * 100;
          res.data.remainingBRatio = (res.data.protein_intake / res.data.protein_requirement) * 100;
          res.data.remainingCRatio = (res.data.fat_intake / res.data.fat_requirement) * 100;

          if (res.data.remainingARatio > 100) {
            res.data.remainingARatio = 100;
          }

          if (res.data.remainingBRatio > 100) {
            res.data.remainingBRatio = 100;
          }

          if (res.data.remainingCRatio > 100) {
            res.data.remainingCRatio = 100;
          }

          res.data.carbohydrate_ratio = Math.round(res.data.carbohydrate_ratio * 100);
          res.data.protein_ratio = Math.round(res.data.protein_ratio * 100);
          res.data.fat_ratio = Math.round(res.data.fat_ratio * 100);

          this.dailyCalorie = res.data;
        })
        .catch((err) => {
          if (err.Msg === '未找到健康档案，请先完成健康评估') {
            this.dailyCalorie = {};
          } else {
            if (err.Code !== -100) {
              uni.showToast({
                title: err.Msg,
                icon: 'none',
                mask: true,
              });
            }
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    onRateChanging(event, filed) {
      let totalWeight =
        this.dailyCalorie.carbohydrate_requirement +
        this.dailyCalorie.protein_requirement +
        this.dailyCalorie.fat_requirement;

      this.dailyCalorie.carbohydrate_requirement = Math.round(
        totalWeight * (this.dailyCalorie.carbohydrate_ratio / 100),
      );
      this.dailyCalorie.protein_requirement = Math.round(totalWeight * (this.dailyCalorie.protein_ratio / 100));
      this.dailyCalorie.fat_requirement = Math.round(totalWeight * (this.dailyCalorie.fat_ratio / 100));

      this.dailyCalorie[filed] = event.detail.value;

      // 保持总比例为100%
      if (filed === 'carbohydrate_ratio') {
        if (Number(this.dailyCalorie.protein_ratio)) {
          this.dailyCalorie.protein_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.fat_ratio);
        } else {
          this.dailyCalorie.fat_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.protein_ratio);
        }
      } else if (filed === 'protein_ratio') {
        if (Number(this.dailyCalorie.fat_ratio)) {
          this.dailyCalorie.fat_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.protein_ratio);
        } else {
          this.dailyCalorie.carbohydrate_ratio =
            100 - Number(this.dailyCalorie.protein_ratio) - Number(this.dailyCalorie.fat_ratio);
        }
      } else if (filed === 'fat_ratio') {
        if (Number(this.dailyCalorie.carbohydrate_ratio)) {
          this.dailyCalorie.carbohydrate_ratio =
            100 - Number(this.dailyCalorie.protein_ratio) - Number(this.dailyCalorie.fat_ratio);
        } else {
          this.dailyCalorie.protein_ratio =
            100 - Number(this.dailyCalorie.carbohydrate_ratio) - Number(this.dailyCalorie.fat_ratio);
        }
      }
    },

    reset() {
      this.dailyCalorie.carbohydrate_ratio = 40;
      this.dailyCalorie.protein_ratio = 20;
      this.dailyCalorie.fat_ratio = 40;

      let totalWeight =
        this.dailyCalorie.carbohydrate_requirement +
        this.dailyCalorie.protein_requirement +
        this.dailyCalorie.fat_requirement;

      this.dailyCalorie.carbohydrate_requirement = Math.round(
        totalWeight * (this.dailyCalorie.carbohydrate_ratio / 100),
      );
      this.dailyCalorie.protein_requirement = Math.round(totalWeight * (this.dailyCalorie.protein_ratio / 100));
      this.dailyCalorie.fat_requirement = Math.round(totalWeight * (this.dailyCalorie.fat_ratio / 100));
    },

    submit() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/diet-info/macronutrient/update', {
          carbs_ratio: Number((this.dailyCalorie.carbohydrate_ratio / 100).toFixed(2)),
          protein_ratio: Number((this.dailyCalorie.protein_ratio / 100).toFixed(2)),
          fat_ratio: Number((this.dailyCalorie.fat_ratio / 100).toFixed(2)),
        })
        .then(() => {
          uni.hideLoading();
          this.close();

          uni.showToast({
            title: '修改成功',
            icon: 'none',
          });

          this.$emit('success');
        });
    },
  },
};
</script>

<style scoped lang="scss">
.change-ratio-dialog {
  width: 100%;
  background: #ffffff;
  border-radius: 60rpx 60rpx 0rpx 0rpx;
  padding: 32rpx 24rpx;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18rpx;

    .title-text {
      font-weight: 600;
      font-size: 28rpx;
      color: #000000;
    }
  }

  .current {
    width: 248rpx;
    height: 60rpx;
    background: #dad2ff;
    border-radius: 60rpx 60rpx 60rpx 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 20rpx;
    color: #313030;
    margin-bottom: 20rpx;
  }

  .tip {
    font-weight: 600;
    font-size: 16rpx;
    color: #313030;
    padding-left: 20rpx;
    margin-bottom: 6rpx;
  }

  .ratio-box {
    padding: 20rpx 36rpx;
    background: #f3f3f3;
    border-radius: 40rpx;
    margin-bottom: 40rpx;

    .ratio-box-title {
      padding: 0 8rpx;
      font-weight: 600;
      font-size: 20rpx;
      color: #313030;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18rpx;
    }

    .calorie-type {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36rpx;

      .calorie-item {
        display: flex;
        flex-direction: column;
        padding: 12rpx 20rpx;
        background: #fcffea;
        border-radius: 10rpx;
        gap: 4rpx;

        .name {
          font-size: 20rpx;
          color: #313030;
        }

        .details {
          padding-left: 100rpx;
          display: flex;
          align-items: center;

          .value {
            font-size: 12rpx;
            color: #333232;
          }
        }
      }
    }

    .ratio-list {
      display: flex;
      flex-direction: column;
      gap: 30rpx;

      .ratio-item {
        display: flex;
        flex-direction: column;

        .ratio-tip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20rpx;
          margin-bottom: 10rpx;

          text {
            &:nth-child(1) {
              font-size: 26rpx;
              color: #666666;
            }

            &:nth-child(2) {
              font-size: 22rpx;
              color: #999999;
            }
          }
        }

        slider {
          width: 100%;
          margin: 0;
          padding: 0;
        }
      }
    }
  }

  .submit {
    width: 654rpx;
    margin: 0 auto;
    height: 80rpx;
    background: #dad2ff;
    border-radius: 60rpx;
    font-size: 28rpx;
    color: #313030;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
