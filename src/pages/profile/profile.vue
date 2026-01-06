<template>
  <view class="profile-page">
    <view class="page-title">
      <text>编辑资料</text>

      <view class="back" @click="$toBack">
        <uni-icons class="back" color="#1A1A1A" type="left" size="22"></uni-icons>
      </view>
    </view>

    <view class="banner"></view>

    <view class="header" @click="editHeaderImg">
      <image
        class="header-img"
        mode="aspectFill"
        :src="userInfo.avatar_url || 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/my/default_head.png'"
      />

      <image
        class="cramer"
        mode="widthFix"
        src="https://hnenjoy.oss-cn-shanghai.aliyuncs.com/food-diary-app/profile/cramer.png"
      />
    </view>

    <view class="nav-container">
      <view class="nav">
        <view class="nav-item">
          <view class="nav-title">昵称</view>
          <view class="name" style="color: #323131">{{ userInfo.uname }}</view>
        </view>

        <view class="nav-item">
          <view class="nav-title">
            <text>绑定手机号</text>
            <text class="phone">{{ userInfo.phone }}</text>
          </view>
          <view class="name" @click="$toRouter('/pages/changePhone/changePhone')">更换手机号</view>
        </view>
      </view>

      <view class="nav">
        <view class="nav-item" @click="$toRouter('/packageLogin/pages/privacy/privacy')">
          <view class="nav-title">隐私协议</view>
          <view class="name">
            <uni-icons color="#999999" type="right" size="14"></uni-icons>
          </view>
        </view>

        <view class="nav-item" v-if="version" @click="update">
          <view class="nav-title">
            <text>检查更新</text>
          </view>
          <view class="name">
            <text class="version">当前版本{{ version }}</text>
            <uni-icons color="#999999" type="right" size="14"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view class="options">
      <view class="sign-out" @click="signOut">退出登录</view>
      <view class="logout" @click="$toRouter('/packageLogin/pages/logout/logout')">注销账号</view>
    </view>

    <uni-popup ref="signOutDialog">
      <view class="sign-out-dialog">
        <view class="title">确认退出登录吗？</view>

        <view class="tip">
          <view>退出登录后将无法继续同步数据、</view>
          <view>无法享受当前权益</view>
        </view>

        <view class="options">
          <view class="btn1" @click="$refs.signOutDialog.close()">取消</view>
          <view class="btn2" @click="submitSignOut">确认</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import $http from '@/utils/http';

export default {
  name: 'profile',

  data() {
    return {
      version: '',
    };
  },

  computed: {
    ...mapState('app', ['userInfo']),
  },

  onLoad() {
    // #ifdef MP-WEIXIN
    let { version } = uni.getAccountInfoSync().miniProgram;
    this.version = version;
    // #endif
  },

  onShareAppMessage() {
    return {
      title: 'AI饮食记录小程序',
      imageUrl: 'https://hnenjoy.oss-cn-shanghai.aliyuncs.com/ouhaiwangluo/share.png',
      path: '/pages/index/index',
    };
  },

  methods: {
    ...mapActions('app', ['_getUserInfo']),

    update() {
      // #ifdef MP-WEIXIN
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });

      const updateManager = uni.getUpdateManager();

      updateManager.onCheckForUpdate((event) => {
        uni.hideLoading();

        if (!event.hasUpdate) {
          uni.showToast({
            title: '当前已是最新版本',
            icon: 'none',
          });
        }
      });

      updateManager.onUpdateReady(() => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启小程序？',
          success(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          },
        });
      });

      updateManager.onUpdateFailed(() => {
        uni.showToast({
          title: '新版本下载失败，请稍后再试',
          icon: 'none',
        });
      });
      // #endif
    },

    editHeaderImg() {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({
            title: '上传中，请稍等...',
            mask: true,
          });

          let filePath = res.tempFiles[0].tempFilePath;
          let url = await this.uploadFile(filePath);

          await $http.post('api/user/auth/userauth/update_wx_info', {
            avatarUrl: url,
          });

          await this._getUserInfo();

          uni.showToast({
            title: '更新成功',
            icon: 'none',
          });
        },
      });
    },

    uploadFile(path) {
      return $http.upload('api/global/fileupload/upload', path, 'file').then((res) => {
        return res.data;
      });
    },

    signOut() {
      this.$refs.signOutDialog.open();
    },

    submitSignOut() {
      uni.showLoading({
        title: '退出中...',
        mask: true,
      });

      $http.post('api/user/auth/userauth/logout').then(() => {
        uni.hideLoading();

        this.$refs.signOutDialog.close();

        uni.showToast({
          title: '退出成功',
          icon: 'none',
          mask: true,
        });

        setTimeout(() => {
          this.$toReLaunch('/pages/index/index');
        }, 1000);
      });
    },
  },
};
</script>

<style>
page {
  height: 100%;
}
</style>

<style scoped lang="scss">
.profile-page {
  background: linear-gradient(180deg, #e8f480cc 0%, #ffffff 100%);
  padding: 0 26rpx 200rpx;
  height: 100%;
  overflow: auto;

  page-title {
  }

  .banner {
    padding: calc(var(--page-title-height)) 0 88rpx;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0 44rpx;
    position: relative;

    .header-img {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
    }

    .cramer {
      position: absolute;
      width: 52rpx;
      bottom: 40rpx;
      right: 260rpx;
    }
  }

  .nav-container {
    background: #f3f3f3;
    border-radius: 20rpx;
    padding: 30rpx 18rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-bottom: 40rpx;

    .nav {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 32rpx 20rpx;
      display: flex;
      flex-direction: column;
      gap: 40rpx;

      .nav-item {
        display: flex;
        align-items: center;

        .nav-title {
          font-weight: 500;
          font-size: 28rpx;
          color: #323131;
          flex-grow: 1;

          .phone {
            margin-left: 20rpx;
            font-size: 28rpx;
            color: #32313180;
          }
        }

        .name {
          font-size: 28rpx;
          color: #32313180;

          .version {
            margin-right: 20rpx;
          }
        }
      }
    }
  }

  .options {
    .sign-out {
      height: 80rpx;
      background: #e8f480;
      border-radius: 20rpx;
      font-size: 28rpx;
      color: #323131;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 26rpx;
    }

    .logout {
      font-size: 28rpx;
      color: #323131;
      text-align: center;
      padding-bottom: 6rpx;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 120rpx;
        height: 2rpx;
        background: #313030;
      }
    }
  }

  .sign-out-dialog {
    width: 702rpx;
    background: #ffffff;
    border-radius: 40rpx;
    padding: 60rpx 52rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .title {
      font-weight: 600;
      font-size: 32rpx;
      color: #000000;
      margin-bottom: 82rpx;
    }

    .tip {
      font-weight: 500;
      font-size: 28rpx;
      color: #000000;
      margin-bottom: 108rpx;

      view {
        line-height: 45rpx;
        text-align: center;
      }
    }

    .options {
      align-self: stretch;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40rpx;

      .btn1 {
        width: 280rpx;
        height: 80rpx;
        background: #e8f480;
        border-radius: 60rpx;
        font-size: 28rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn2 {
        width: 280rpx;
        height: 80rpx;
        background: #fcffea;
        border-radius: 60rpx;
        font-size: 28rpx;
        color: #323131;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
