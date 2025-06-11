<template>
  <div class="live-room-container">
    <!-- 这个 div 是 Daily 播放器要挂载的地方 -->
    <div ref="dailyContainer" class="daily-player-wrapper"></div>

    <!-- 覆盖在播放器上方的状态提示 -->
    <div v-if="liveStatus !== 'live'" class="status-overlay">
      <div v-if="liveStatus === 'loading'" class="status-content">
        <div class="loader"></div>
        <p>正在连接直播间...</p>
      </div>
      <div v-else-if="liveStatus === 'idle'" class="status-content">
        <p class="idle-text">主播正在休息中 ☕</p>
        <p class="subtext">可以去 <router-link to="/community">社区动态</router-link> 逛逛喔～</p>
        <el-button type="primary" @click="goBack" class="back-button">返回</el-button>
      </div>
      <div v-else-if="liveStatus === 'error'" class="status-content">
        <p class="error-text">连接出错了 🤔</p>
        <p class="subtext">{{ errorMessage }}</p>
        <el-button type="primary" @click="goBack" class="back-button">返回</el-button>
      </div>
    </div>

    <!-- 返回按钮，只在直播中显示 -->
    <div v-if="liveStatus === 'live'" class="back-button-container">
      <el-button type="primary" @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { DailyCall } from '@daily-co/daily-js';
import DailyIframe from '@daily-co/daily-js';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

// --- 状态定义 ---
let callFrame: DailyCall | null = null;
const dailyContainer = ref<HTMLDivElement | null>(null);
const liveStatus = ref<'loading' | 'live' | 'idle' | 'error'>('loading');
const errorMessage = ref('');
const router = useRouter();

// --- 生命周期钩子 ---
onMounted(() => {
  if (!dailyContainer.value) {
    liveStatus.value = 'error';
    errorMessage.value = '播放器容器不存在';
    return;
  }
  
  // 初始化 Daily，我们用 Frame 模式，因为它最简单
  callFrame = DailyIframe.createFrame(dailyContainer.value, {
    // 隐藏 Daily 自己的 UI，我们用自己的
    showLeaveButton: false,
    showParticipantsBar: false,
  });

  setupEventListeners();

  const domain = import.meta.env.VITE_DAILY_DOMAIN_URL;
  if (!domain) {
    ElMessage.error("直播设定有误：找不到域名！");
    liveStatus.value = 'error';
    errorMessage.value = '应用配置错误';
    return;
  }
  const roomUrl = `${domain}/pet-live-main`;
  
  // 尝试加入房间
  try {
    callFrame.join({ url: roomUrl });
  } catch (error: any) {
    console.error('加入房间失败:', error);
    liveStatus.value = 'error';
    errorMessage.value = error?.message || '连接直播服务器失败';
  }
});

onUnmounted(() => {
  if (callFrame) {
    // 移除所有监听器，避免内存泄露
    callFrame.off('joined-meeting', handleJoinedMeeting)
             .off('participant-joined', handleParticipantChange)
             .off('participant-left', handleParticipantChange)
             .off('error', handleError);
    
    // 彻底销毁
    callFrame.destroy();
  }
});


// --- 事件处理辅助函数 ---
function setupEventListeners() {
    if (!callFrame) return;

    callFrame.on('joined-meeting', handleJoinedMeeting);
    callFrame.on('participant-joined', handleParticipantChange);
    callFrame.on('participant-left', handleParticipantChange);
    callFrame.on('error', handleError);
}

function handleJoinedMeeting(event: any) {
    console.log("✅ [观众端] 成功加入房间!", event);
    updateLiveStatus();
}

function handleParticipantChange(event: any) {
    console.log(`👤 [观众端] 参与者变化: ${event.action}`, event.participant);
    updateLiveStatus();
}

function handleError(event: any) {
    console.error('❌ [观众端] Daily 报告了一个错误:', event);
    liveStatus.value = 'error';
    errorMessage.value = event?.errorMsg || '未知连接错误';
}


// --- 核心逻辑：更新直播状态 ---
function updateLiveStatus() {
  if (!callFrame) return;
  
  // Daily 的 participants() 会返回一个包含所有人的物件
  const participants = callFrame.participants();
  const participantCount = Object.keys(participants).length;
  
  console.log(`[状态检查] 当前房间人数: ${participantCount}`);

  // 如果房间里多于1个人（自己+主播），那就是正在直播
  if (participantCount > 1) {
    liveStatus.value = 'live';
    console.log("🟢 状态更新 -> live (直播中)");
  } else {
    // 否则，就是主播不在
    liveStatus.value = 'idle';
    console.log("🟠 状态更新 -> idle (主播不在)");
  }
}

// 返回上一页
function goBack() {
  router.push('/live');
}

</script>

<style scoped>
.live-room-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
}

.daily-player-wrapper {
  width: 100%;
  height: 100%;
}

.daily-player-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  color: white;
  text-align: center;
  z-index: 10;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

p {
  font-size: 1.5rem;
  font-weight: 500;
}

.subtext {
  font-size: 1rem;
  color: #ccc;
}
.subtext a {
  color: #409EFF;
  text-decoration: none;
}
.subtext a:hover {
  text-decoration: underline;
}

.error-text {
  color: #F56C6C;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.back-button-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>