<template>
  <div class="live-entry-container">
    <div class="live-header">
      <h1>宠爱社区直播间</h1>
      <p class="subtitle">与宠物爱好者实时互动，分享宠物养护知识和有趣时刻</p>
    </div>

    <div class="live-options">
      <div class="live-card" @click="goToLiveRoom">
        <div class="card-icon">
          <el-icon><VideoPlay /></el-icon>
        </div>
        <h2>观看直播</h2>
        <p>进入直播间观看宠物专家分享的实时内容</p>
        <el-button type="primary" size="large" class="action-button">进入直播间</el-button>
      </div>

      <div class="live-card" v-if="isLoggedIn" @click="goToBroadcastDashboard">
        <div class="card-icon">
          <el-icon><VideoCameraFilled /></el-icon>
        </div>
        <h2>开始直播</h2>
        <p>分享您的宠物知识和经验，与社区成员互动</p>
        <el-button type="success" size="large" class="action-button">进入控制室</el-button>
      </div>

      <div class="live-card login-card" v-else @click="goToLogin">
        <div class="card-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <h2>登录后开播</h2>
        <p>登录您的账户后即可开始直播</p>
        <el-button type="info" size="large" class="action-button">去登录</el-button>
      </div>
    </div>

    <div class="live-info">
      <h3>直播须知</h3>
      <ul>
        <li>直播内容应当与宠物相关，包括但不限于宠物护理、训练、医疗等</li>
        <li>请尊重所有观众，禁止发布不当内容</li>
        <li>如遇技术问题，请联系我们的客服团队</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { VideoPlay, VideoCameraFilled, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 计算用户是否已登录
const isLoggedIn = computed(() => userStore.isAuthenticated);

// 跳转到直播控制室
const goToBroadcastDashboard = () => {
  console.log('跳转到直播控制室');
  window.location.href = '/admin/broadcast';
};

// 跳转到直播观看页面
const goToLiveRoom = () => {
  console.log('跳转到直播观看页面');
  window.location.href = '/live-room';
};

// 跳转到登录页面
const goToLogin = () => {
  console.log('跳转到登录页面');
  window.location.href = '/login';
};
</script>

<style scoped>
.live-entry-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.live-header {
  text-align: center;
  margin-bottom: 50px;
}

.live-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

.live-options {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.live-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 300px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.live-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #409EFF;
  background-color: #ecf5ff;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .el-icon {
  font-size: 2rem;
}

.live-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.live-card p {
  color: #666;
  margin-bottom: 20px;
  flex-grow: 1;
}

.action-button {
  width: 100%;
}

.login-card .card-icon {
  color: #909399;
  background-color: #f4f4f5;
}

.live-info {
  max-width: 800px;
  margin: 0 auto;
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
}

.live-info h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #333;
}

.live-info ul {
  padding-left: 20px;
}

.live-info li {
  margin-bottom: 10px;
  color: #555;
}

@media (max-width: 768px) {
  .live-options {
    flex-direction: column;
    align-items: center;
  }
  
  .live-card {
    width: 100%;
    max-width: 350px;
  }
  
  .live-header h1 {
    font-size: 2rem;
  }
}
</style> 