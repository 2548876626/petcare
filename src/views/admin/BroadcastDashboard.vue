<template>
    <div class="broadcast-dashboard">
      <h1 class="title">直播控制室</h1>
      
      <div class="preview-container">
        <!-- 这个 video 元素就是我们用来预览本地摄像头的 "监视器" -->
        <video ref="localVideoPlayer" autoplay muted playsinline></video>
        
        <!-- 这是一个小小的状态指示灯 -->
        <div class="status-indicator" :class="{ active: isStreaming }">
          <span class="dot"></span>
          {{ isStreaming ? '直播中' : '未开播' }}
        </div>
      </div>
      
      <div class="controls">
        <!-- 根据 isStreaming 的状态，显示不同的按钮 -->
        <button v-if="!isStreaming" class="start-btn" @click="startBroadcast" :disabled="isLoading">
          <span class="icon">▶️</span> {{ isLoading ? '连接中...' : '开始直播' }}
        </button>
        <button v-else class="stop-btn" @click="stopBroadcast">
          <span class="icon">⏹️</span> 结束直播
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted, nextTick } from 'vue';
  import type { DailyCall, DailyParticipant } from '@daily-co/daily-js';
  import DailyIframe from '@daily-co/daily-js';
  import { ElMessage } from 'element-plus';
  
  // --- 状态定义 ---
  let callFrame: DailyCall | null = null;       // 用来存放 Daily 的核心物件
  const isStreaming = ref(false);             // 判断是否正在直播中
  const isLoading = ref(false);               // 判断是否正在"连接中"，防止重复点击
  const localVideoPlayer = ref<HTMLVideoElement | null>(null); // 引用模板里的 <video> 元素
  
  // --- 核心函数：开始直播 ---
  async function startBroadcast() {
  console.log("▶️ '开始直播'按钮被点击了！");

  if (isStreaming.value || isLoading.value) {
    ElMessage.warning("操作进行中，请勿重复点击！");
    return;
  }

  isLoading.value = true;

  try {
    console.log("1. 正在创建 Daily call object...");
    // ✅ 【返璞归真】创建物件时，什么额外的参数都不要给！
    callFrame = DailyIframe.createCallObject();
    console.log("✅ Daily call object 创建成功！");

    setupEventListeners();

    const domain = import.meta.env.VITE_DAILY_DOMAIN_URL;
    if (!domain) throw new Error("VITE_DAILY_DOMAIN_URL 环境变量未设定！");
    const roomUrl = `${domain}/pet-live-main`;
    console.log(`✅ URL 构造成功: ${roomUrl}`);

    // ✅ 【返璞归真】加入房间时，也只给最基本的 URL，其他什么都不要说！
    console.log("3. 正在加入房间 (join)...");
    await callFrame.join({ url: roomUrl });

    // ✅ 【关键在这里！】我们等加入成功之后，再手动、明确地开启摄像头！
    console.log("4. 房间加入成功，现在手动开启摄像头...");
    await callFrame.setLocalVideo(true);
    console.log("✅ 摄像头已明确开启！");
    
    // isStreaming 和 isLoading 的状态现在由 'joined-meeting' 事件处理器来管理

  } catch (error: any) {
    console.error("❌ 在 startBroadcast 中捕捉到了一个错误:", error);
    ElMessage.error(`开始直播失败: ${error.message || '未知错误'}`);
    isLoading.value = false;
    if (callFrame) {
      await callFrame.destroy();
      callFrame = null;
    }
  }
}
  
  // --- 核心函数：结束直播 ---
  async function stopBroadcast() {
    console.log("⏹️ '结束直播'按钮被点击了！");
    
    if (!callFrame) {
      console.warn("⚠️ 操作中止：没有正在进行的直播。");
      return;
    }
    
    try {
      await callFrame.leave();
    } catch(error) {
      console.error("❌ leave 时发生错误:", error);
    } finally {
      // 【深度清洁】无论成功与否，都要把状态清乾净！
      callFrame = null;
      isStreaming.value = false;
      isLoading.value = false;
      if(localVideoPlayer.value) {
          localVideoPlayer.value.srcObject = null;
      }
      ElMessage.success("直播已结束");
      console.log("✅ 直播已完全清理乾净。");
    }
  }
  
  // --- 辅助函数：设置事件监听 ---
  function setupEventListeners() {
      if (!callFrame) return;
  
      // 当我们自己（本地用户）的影像轨准备好时
      callFrame.on('track-started', handleTrackStarted);
  
      // 当我们自己成功加入会议时
      callFrame.on('joined-meeting', handleJoinedMeeting);
  
      // 错误处理
      callFrame.on('error', handleError);
  }
  
  function handleTrackStarted(event: any) {
      // 我们只关心我们自己的、本地的、影像轨
      if (event.participant?.local && event.track.kind === 'video') {
          console.log("🎥 'track-started' 事件触发 (本地视频)！");
          attachTrack(event.participant);
      }
  }
  
  function handleJoinedMeeting(event: any) {
      console.log("✅ 'joined-meeting' 事件触发！已成功加入房间！");
      isLoading.value = false; // 加载完成
      isStreaming.value = true;
      ElMessage.success("成功加入房间，直播已开始！");
      if (event.participants.local) {
          attachTrack(event.participants.local);
      }
  }
  
  function handleError(event: any) {
      console.error('❌ Daily 报告了一个错误:', event);
      ElMessage.error(`直播发生错误: ${event.errorMsg}`);
      stopBroadcast(); // 发生错误时，自动结束直播并清理
  }
  
  
  // 这是一个专门用来"接线"的辅助函式
  function attachTrack(participant: DailyParticipant) {
      if (participant.video && participant.tracks.video.persistentTrack) {
          console.log(`正在将 ${participant.session_id} 的视频轨接到播放器上...`);
          nextTick(() => {
              if(localVideoPlayer.value) {
                  const videoTrack = participant.tracks.video.persistentTrack;
                  if (videoTrack) {
                      // 确保视频轨道存在后再创建MediaStream
                      try {
                          const mediaStream = new MediaStream([videoTrack]);
                          localVideoPlayer.value.srcObject = mediaStream;
                          console.log("✅ 视频轨道成功连接到播放器");
                      } catch (error) {
                          console.error("❌ 创建MediaStream时出错:", error);
                          ElMessage.error("无法显示视频预览");
                      }
                  } else {
                      console.warn("⚠️ 视频轨道不存在");
                      ElMessage.warning("摄像头未就绪，请检查权限设置");
                  }
              }
          });
      } else {
          console.warn("⚠️ 参与者没有视频或视频轨道不可用");
      }
  }
  
  // 在组件卸载时（比如离开这个页面），也要进行深度清洁！
  onUnmounted(() => {
    if (isStreaming.value || callFrame) {
      console.log("组件正在卸载，执行最后的清理...");
      stopBroadcast();
    }
  });
  </script>
  
  <style scoped>
  .broadcast-dashboard {
    max-width: 1200px;
    margin: 40px auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #333;
  }
  
  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #4A4A4A;
  }
  
  .preview-container {
    width: 100%;
    max-width: 800px; /* 限制最大宽度，避免在超大屏幕上过于拉伸 */
    aspect-ratio: 16 / 9;
    background-color: #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    border: 1px solid #ddd;
  }
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 保证视频填满容器，不变形 */
  }
  
  .status-indicator {
    position: absolute;
    top: 15px;
    left: 15px; /* 改到左边，更像专业软体 */
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }
  
  .status-indicator .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #9E9E9E; /* 灰色代表未开播 */
    transition: background-color 0.3s ease;
  }
  
  .status-indicator.active .dot {
    background-color: #F44336; /* 红色代表直播中 */
    animation: pulse 2s infinite;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 160px;
    padding: 12px 28px;
    border: none;
    border-radius: 50px; /* 更圆润的按钮 */
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .start-btn {
    background: linear-gradient(45deg, #43A047, #66BB6A);
    color: white;
  }
  
  .start-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  }
  
  .stop-btn {
    background: linear-gradient(45deg, #E53935, #F44336);
    color: white;
  }
  
  .stop-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
  }
  
  .icon {
    font-size: 20px;
    line-height: 1;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
    100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
  }
  
  @media (max-width: 768px) {
    .broadcast-dashboard { padding: 15px; }
    .title { font-size: 1.8rem; }
    button { padding: 10px 20px; font-size: 16px; }
  }
  </style>