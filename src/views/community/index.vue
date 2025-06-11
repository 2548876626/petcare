<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// 导入文章图片
import homemadeTreatsImg from '@/assets/articles/homemade-treats.jpg'
import separationAnxietyImg from '@/assets/articles/separation-anxiety.jpg'
import summerHealthImg from '@/assets/articles/summer-health.jpg'
import newPetGuideImg from '@/assets/articles/new-pet-guide.jpg'
import catBehaviorImg from '@/assets/articles/cat-behavior.jpg'

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

// 文章数据
const posts = ref<Post[]>([])
const loading = ref(false)

// 获取所有文章
const fetchAllPosts = async () => {
  loading.value = true
  
  // 使用静态数据替代从 Supabase 获取的数据
  posts.value = [
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
    },
    {
      id: 4,
      title: '新手养宠必读：选择适合您家庭的宠物',
      summary: '为新手宠物主人提供选择合适宠物的建议和指南。',
      content: '',
      author: '宠爱顾问',
      cover_image_url: '',
      published_at: '2023-08-02',
      created_at: '2023-08-02',
      imageName: 'new-pet-guide.jpg'
    },
    {
      id: 5,
      title: '猫咪行为解读：理解您猫咪的肢体语言',
      summary: '学习如何理解猫咪的各种行为和肢体语言，增进与爱宠的沟通。',
      content: '',
      author: '宠爱猫咪专家',
      cover_image_url: '',
      published_at: '2023-07-28',
      created_at: '2023-07-28',
      imageName: 'cat-behavior.jpg'
    }
  ];
  
  loading.value = false;
}

// 页面加载时获取数据
onMounted(() => {
  fetchAllPosts()
})
</script>

<template>
  <div class="community-page">
    <section class="page-header">
      <h1 class="page-title">社区动态</h1>
      <p class="page-subtitle">了解最新的宠物社区活动和资讯</p>
    </section>
    
    <section class="content-section" v-loading="loading">
      <!-- 当没有文章时显示提示 -->
      <div v-if="posts.length === 0 && !loading" class="no-posts">
        <p class="placeholder-text">暂无文章，请稍后再来查看</p>
      </div>
      
      <!-- 文章列表 -->
      <div v-else class="posts-grid">
        <router-link v-for="post in posts" :key="post.id" :to="'/post/' + post.id" class="post-link">
          <div class="post-card">
            <div class="post-image">
              <img v-if="post.imageName" :src="getImageUrl(post.imageName)" :alt="post.title">
              <img v-else :src="post.cover_image_url" :alt="post.title">
            </div>
            <div class="post-content">
              <div class="post-meta">
                <span class="post-date">{{ new Date(post.published_at).toLocaleDateString() }}</span>
                <span class="post-author">by {{ post.author }}</span>
              </div>
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-summary">{{ post.summary }}</p>
              <div class="read-more">
                <span>阅读全文</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.community-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
}

.content-section {
  min-height: 300px;
}

.no-posts {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.placeholder-text {
  font-size: 18px;
  color: #666;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.post-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.post-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.post-image {
  height: 200px;
  overflow: hidden;
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

.post-content {
  padding: 20px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.3;
}

.post-summary {
  color: #666;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.read-more {
  color: #409eff;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 