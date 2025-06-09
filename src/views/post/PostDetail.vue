<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()
const postId = route.params.id
const post = ref<Post | null>(null)
const loading = ref(false)

// 获取文章详情
const fetchPostDetail = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    
    if (error) {
      console.error('获取文章详情失败:', error)
      return
    }
    
    post.value = data as Post
  } catch (error) {
    console.error('获取文章详情出错:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<template>
  <div class="post-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 文章不存在 -->
    <div v-else-if="!post" class="not-found">
      <h2>文章未找到</h2>
      <p>您查找的文章不存在或已被删除</p>
      <router-link to="/community" class="back-link">
        返回社区动态
      </router-link>
    </div>
    
    <!-- 文章详情 -->
    <div v-else class="post-container">
      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="post-date">发布时间: {{ new Date(post.published_at).toLocaleDateString() }}</span>
          <span class="post-author">作者: {{ post.author }}</span>
        </div>
      </div>
      
      <div class="post-cover">
        <img :src="post.cover_image_url" :alt="post.title">
      </div>
      
      <div class="post-content" v-html="post.content"></div>
      
      <div class="post-footer">
        <router-link to="/community" class="back-to-list">
          返回社区动态列表
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-container {
  padding: 30px;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

.not-found h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 16px;
}

.not-found p {
  color: #666;
  margin-bottom: 24px;
}

.back-link {
  display: inline-block;
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.post-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.post-header {
  padding: 30px 30px 20px;
}

.post-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.3;
}

.post-meta {
  color: #999;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.post-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 30px;
  line-height: 1.8;
  color: #333;
}

.post-content :deep(h2) {
  margin: 24px 0 16px;
  font-size: 22px;
  color: #333;
}

.post-content :deep(p) {
  margin-bottom: 16px;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 20px 0;
  border-radius: 4px;
}

.post-footer {
  padding: 20px 30px 30px;
  border-top: 1px solid #eee;
}

.back-to-list {
  display: inline-block;
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.back-to-list:hover {
  color: #66b1ff;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 24px;
  }
  
  .post-cover {
    height: 250px;
  }
  
  .post-header,
  .post-content,
  .post-footer {
    padding: 20px;
  }
}
</style> 