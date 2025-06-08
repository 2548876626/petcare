<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 静态数据 - 宠物服务卡片
const petServices = ref([
  {
    id: 1,
    title: '宠物寄养',
    description: '为您的宠物提供温馨、安全的寄养环境，让您安心出行无忧。',
    image: 'https://source.unsplash.com/random/300x200?pet+care',
    icon: 'House'
  },
  {
    id: 2,
    title: '宠物医疗',
    description: '专业的兽医团队提供全面的宠物健康检查和疾病治疗服务。',
    image: 'https://source.unsplash.com/random/300x200?vet',
    icon: 'FirstAidKit'
  },
  {
    id: 3,
    title: '宠物美容',
    description: '为您的爱宠提供专业的美容服务，让它们保持靓丽外表。',
    image: 'https://source.unsplash.com/random/300x200?pet+grooming',
    icon: 'Scissors'
  },
  {
    id: 4,
    title: '宠物训练',
    description: '专业的训犬师团队帮助您的宠物养成良好习惯。',
    image: 'https://source.unsplash.com/random/300x200?pet+training',
    icon: 'Medal'
  }
])

// 静态数据 - 社区动态
const communityUpdates = ref([
  {
    id: 1,
    title: '新手养宠必读：选择适合您家庭的宠物',
    date: '2023-08-12',
    author: '王小明',
    summary: '如何为您的家庭选择一只合适的宠物？本文将从多方面为您分析...',
    image: 'https://source.unsplash.com/random/400x300?puppies'
  },
  {
    id: 2,
    title: '夏季宠物保健指南：预防中暑的方法',
    date: '2023-08-05',
    author: '李医生',
    summary: '炎炎夏日，宠物也会中暑，本指南帮您了解预防措施和应对方法...',
    image: 'https://source.unsplash.com/random/400x300?dog+summer'
  },
  {
    id: 3,
    title: '猫咪行为解读：理解您猫咪的肢体语言',
    date: '2023-07-28',
    author: '张小猫',
    summary: '猫咪的每个动作都在传递信息，本文帮您读懂猫咪的心思...',
    image: 'https://source.unsplash.com/random/400x300?cat+behavior'
  }
])

// 跳转到服务列表页
const viewAllServices = () => {
  router.push('/services')
}
</script>

<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">让爱宠生活更美好</h1>
        <p class="hero-subtitle">宠爱社区 - 一站式宠物服务平台</p>
        <el-button type="primary" size="large" @click="viewAllServices">
          探索服务
        </el-button>
      </div>
    </section>

    <!-- 服务展示区 -->
    <section class="services-section">
      <div class="section-header">
        <h2 class="section-title">我们的服务</h2>
        <p class="section-description">为您的爱宠提供全方位专业服务</p>
      </div>
      
      <el-row :gutter="20" class="service-cards">
        <el-col v-for="service in petServices" :key="service.id" :xs="24" :sm="12" :md="6">
          <el-card class="service-card" shadow="hover">
            <div class="service-image">
              <img :src="service.image" :alt="service.title">
            </div>
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-description">{{ service.description }}</p>
            <el-button text>了解更多</el-button>
          </el-card>
        </el-col>
      </el-row>
      
      <div class="view-all">
        <el-button type="primary" plain @click="viewAllServices">查看全部服务</el-button>
      </div>
    </section>

    <!-- 社区动态区 -->
    <section class="community-section">
      <div class="section-header">
        <h2 class="section-title">社区动态</h2>
        <p class="section-description">分享宠物养护知识与社区新闻</p>
      </div>
      
      <el-row :gutter="30" class="community-posts">
        <el-col v-for="post in communityUpdates" :key="post.id" :xs="24" :sm="24" :md="8">
          <el-card class="post-card" shadow="hover">
            <div class="post-image">
              <img :src="post.image" :alt="post.title">
            </div>
            <div class="post-meta">
              <span class="post-date">{{ post.date }}</span>
              <span class="post-author">by {{ post.author }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-summary">{{ post.summary }}</p>
            <el-button text>阅读全文</el-button>
          </el-card>
        </el-col>
      </el-row>
    </section>
    
    <!-- 注册推广区 -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">加入我们的宠物爱好者社区</h2>
        <p class="cta-description">立即注册，享受更多专属服务和社区互动</p>
        <div class="cta-buttons">
          <el-button type="primary" size="large" @click="router.push('/register')">立即注册</el-button>
          <el-button plain size="large" @click="router.push('/login')">已有账号？登录</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

/* 英雄区样式 */
.hero-section {
  height: 500px;
  background-image: url('https://source.unsplash.com/random/1600x900?pets');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

/* 通用部分样式 */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 1.1rem;
  color: #666;
}

/* 服务区样式 */
.services-section {
  padding: 60px 20px;
  background-color: #f9f9f9;
}

.service-cards {
  margin-bottom: 30px;
}

.service-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-image {
  height: 180px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.service-card:hover .service-image img {
  transform: scale(1.05);
}

.service-title {
  font-size: 1.25rem;
  margin-bottom: 10px;
  color: #333;
}

.service-description {
  flex-grow: 1;
  color: #666;
  margin-bottom: 15px;
}

.view-all {
  text-align: center;
  margin-top: 20px;
}

/* 社区动态区样式 */
.community-section {
  padding: 60px 20px;
}

.post-card {
  height: 100%;
  margin-bottom: 20px;
}

.post-image {
  height: 200px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.post-meta {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 10px;
}

.post-author {
  margin-left: 10px;
}

.post-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.post-summary {
  color: #666;
  margin-bottom: 15px;
}

/* 注册推广区样式 */
.cta-section {
  padding: 80px 20px;
  background-color: #409eff;
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 