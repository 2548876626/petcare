<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import heroImageUrl from '@/assets/images/hero-background.jpg'
import { supabase } from '@/lib/supabaseClient'
import { ElLoading } from 'element-plus'

// 导入文章图片
import homemadeTreatsImg from '@/assets/articles/homemade-treats.jpg'
import separationAnxietyImg from '@/assets/articles/separation-anxiety.jpg'
import summerHealthImg from '@/assets/articles/summer-health.jpg'
import newPetGuideImg from '@/assets/articles/new-pet-guide.jpg'
import catBehaviorImg from '@/assets/articles/cat-behavior.jpg'

// 文章接口定义
interface Post {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  cover_image_url: string;
  published_at: string;
  created_at: string;
  imageName?: string; // 添加可选的图片名称字段
}

const router = useRouter()

// 获取本地图片函数
const getLocalImage = (imageName: string) => {
  return `/images/${imageName}`
}

// 图片映射对象
const articleImages: Record<string, string> = {
  'homemade-treats.jpg': homemadeTreatsImg,
  'separation-anxiety.jpg': separationAnxietyImg,
  'summer-health.jpg': summerHealthImg,
  'new-pet-guide.jpg': newPetGuideImg,
  'cat-behavior.jpg': catBehaviorImg
}

// 获取文章图片函数
const getImageUrl = (imageName: string) => {
  return articleImages[imageName] || ''
}

// 静态数据 - 宠物服务卡片
const petServices = ref([
  {
    id: 1,
    title: '宠物寄养',
    description: '为您的宠物提供温馨、安全的寄养环境，让您安心出行无忧。',
    image: getLocalImage('pet-boarding.jpg'),
    icon: 'House'
  },
  {
    id: 2,
    title: '宠物医疗',
    description: '专业的兽医团队提供全面的宠物健康检查和疾病治疗服务。',
    image: getLocalImage('pet-health-check.jpg'),
    icon: 'FirstAidKit'
  },
  {
    id: 3,
    title: '宠物美容',
    description: '为您的爱宠提供专业的美容服务，让它们保持靓丽外表。',
    image: getLocalImage('pet-grooming.jpg'),
    icon: 'Scissors'
  },
  {
    id: 4,
    title: '宠物训练',
    description: '专业的训犬师团队帮助您的宠物养成良好习惯。',
    image: getLocalImage('pet-training.jpg'),
    icon: 'Medal'
  }
])

// 社区动态文章数据 - 使用静态数据替代从 Supabase 获取的数据
const communityUpdates = ref<Post[]>([
  {
    id: 1,
    title: '自制宠物零食：健康又美味的食谱分享',
    summary: '了解如何在家制作健康美味的宠物零食，让您的爱宠享受健康的美食。',
    content: '',
    author: '宠爱编辑',
    cover_image_url: '',
    published_at: '2023-08-20',
    created_at: '2023-08-20',
    imageName: 'homemade-treats.jpg'
  },
  {
    id: 2,
    title: '狗狗分离焦虑怎么办？五个实用训练技巧',
    summary: '帮助您的狗狗克服分离焦虑，让它们在您不在家时也能保持平静。',
    content: '',
    author: '宠爱训犬师',
    cover_image_url: '',
    published_at: '2023-08-15',
    created_at: '2023-08-15',
    imageName: 'separation-anxiety.jpg'
  },
  {
    id: 3,
    title: '夏季宠物保健指南：预防中暑的方法',
    summary: '了解如何在炎热的夏季保护您的宠物健康，预防中暑和其他夏季常见问题。',
    content: '',
    author: '宠爱兽医',
    cover_image_url: '',
    published_at: '2023-08-05',
    created_at: '2023-08-05',
    imageName: 'summer-health.jpg'
  }
])
const loadingPosts = ref(false)

// 获取最新文章 - 不再从 Supabase 获取
const fetchLatestPosts = async () => {
  // 使用静态数据，不再从 Supabase 获取
  loadingPosts.value = false
}

// 跳转到服务列表页
const viewAllServices = () => {
  router.push('/services')
}

// 页面加载时获取数据
onMounted(() => {
  fetchLatestPosts()
})
</script>

<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
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
        <h2 class="section-title">
          社区动态
          <router-link to="/community" class="view-more-link">查看更多 →</router-link>
        </h2>
        <p class="section-description">分享宠物养护知识与社区新闻</p>
      </div>
      
      <el-row v-loading="loadingPosts" :gutter="30" class="community-posts">
        <el-col v-if="communityUpdates.length === 0 && !loadingPosts" :span="24">
          <div class="no-posts">
            <p>暂无文章，请稍后再来查看</p>
          </div>
        </el-col>
        
        <el-col v-for="post in communityUpdates" :key="post.id" :xs="24" :sm="24" :md="8">
          <router-link :to="'/post/' + post.id" class="post-link">
            <el-card class="post-card" shadow="hover">
              <div class="post-image">
                <img v-if="post.imageName" :src="getImageUrl(post.imageName)" :alt="post.title">
                <img v-else :src="post.cover_image_url" :alt="post.title">
              </div>
              <div class="post-meta">
                <span class="post-date">{{ new Date(post.published_at).toLocaleDateString() }}</span>
                <span class="post-author">by {{ post.author }}</span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-summary">{{ post.summary }}</p>
              <div class="read-more">
                <span>阅读全文</span>
              </div>
            </el-card>
          </router-link>
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
  position: relative;
  display: inline-block;
}

.view-more-link {
  font-size: 1rem;
  color: #409eff;
  margin-left: 15px;
  font-weight: normal;
  vertical-align: middle;
  text-decoration: none;
  transition: color 0.3s;
}

.view-more-link:hover {
  color: #66b1ff;
  text-decoration: underline;
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

.post-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.post-card {
  height: 100%;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more {
  color: #409eff;
  font-weight: 500;
  margin-top: auto;
}

.no-posts {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
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
  
  .view-more-link {
    display: block;
    margin-left: 0;
    margin-top: 5px;
  }
}
</style> 