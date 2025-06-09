<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

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
}

// 文章数据
const posts = ref<Post[]>([])
const loading = ref(false)

// 获取所有文章
const fetchAllPosts = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('获取文章失败:', error)
      return
    }
    
    posts.value = data as Post[]
  } catch (error) {
    console.error('获取文章出错:', error)
  } finally {
    loading.value = false
  }
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
              <img :src="post.cover_image_url" :alt="post.title">
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