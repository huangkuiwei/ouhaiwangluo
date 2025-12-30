<template>
  <custom-dialog ref="recodeDialog" title="成长记录">
    <view class="content">
      <view class="recode-list">
        <template v-if="recodeList.length">
          <view class="recode-item" v-for="(item, index) of recodeList" :key="index">
            <text>{{ item.create_at.slice(0, 10) }}</text>
            <text v-if="item.change_type === 1">施肥1次，小树增高{{ item.change_height }}厘米</text>
            <text v-else-if="item.change_type === 2">兑换会员，小树增高{{ item.change_height }}厘米</text>
            <text v-else-if="item.change_type === 3">小树增高{{ item.change_height }}厘米</text>
          </view>
        </template>

        <view class="empty-recode" v-else>暂无施肥记录</view>
      </view>
    </view>

    <view slot="footer" class="btn" @click="close">我知道了</view>
  </custom-dialog>
</template>

<script>
import customDialog from '@/components/customDialog.vue';
import $http from '@/utils/http';

export default {
  name: 'recodeDialog',

  components: {
    customDialog,
  },

  data() {
    return {
      recodeList: [],
    };
  },

  methods: {
    getRecodeList() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      $http
        .post('api/health-tree/tree-record', {
          pageIndex: 1,
          pageSize: 9999,
        })
        .then((res) => {
          uni.hideLoading();

          this.recodeList = res.data.Items;
        });
    },

    open() {
      this.getRecodeList();
      this.$refs.recodeDialog.open();
    },

    close() {
      this.$refs.recodeDialog.close();
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  background: #f3f3f3;
  border-radius: 40rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .recode-list {
    display: flex;
    flex-direction: column;
    min-height: 200rpx;

    .empty-recode {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #323131cc;
      padding: 100rpx 0;
    }

    .recode-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:not(:last-child) {
        padding-bottom: 10rpx;
        margin-bottom: 10rpx;
        border-bottom: 4rpx solid #ffffff;
      }

      text {
        font-size: 20rpx;
        color: #323131;
      }
    }
  }
}

.btn {
  width: 100%;
  height: 60rpx;
  background: #dad2ff;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #323131;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
