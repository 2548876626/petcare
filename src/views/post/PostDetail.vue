<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  imageName?: string;
}

const route = useRoute()
const router = useRouter()
const postId = route.params.id
const post = ref<Post | null>(null)
const loading = ref(false)

// 获取文章详情
const fetchPostDetail = async () => {
  loading.value = true
  
  // 使用静态数据替代从 Supabase 获取的数据
  const staticPosts = [
    {
      id: 1,
      title: '自制宠物零食：健康又美味的食谱分享',
      summary: '了解如何在家制作健康美味的宠物零食，让您的爱宠享受健康的美食。',
      content: '<p>宠物零食是我们犬猫朋友们最喜欢的奖励之一，但市售的零食可能含有防腐剂和添加剂。本文将分享几个简单又健康的自制宠物零食食谱，让您的爱宠享受健康美味。</p><h2>狗狗饼干食谱</h2><p>材料：全麦面粉2杯、燕麦片1杯、花生酱1/2杯、南瓜泥1/2杯、鸡蛋1个</p><p>做法：将所有材料混合，揉成面团，擀平后切成小块，在175℃烤箱中烤25分钟即可。</p><h2>猫咪鲜肉零食</h2><p>材料：鸡胸肉200克、蛋黄1个、猫薄荷少许（可选）</p><p>做法：将鸡胸肉煮熟后切碎，与蛋黄混合，制成小球，在120℃烤箱中烤30分钟至完全干燥。</p>',
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
      content: '<p>分离焦虑是许多狗狗面临的常见问题，特别是在主人需要外出工作或旅行时。以下是五个实用的训练技巧，帮助您的爱犬克服分离焦虑。</p><h2>1. 逐步适应训练</h2><p>从短时间的分离开始，逐渐延长时间。先离开几分钟，然后回来，慢慢增加分离时间。</p><h2>2. 建立离开信号</h2><p>创建一个特定的信号，如拿起钥匙但不离开，帮助狗狗理解这些动作不一定意味着您会长时间离开。</p><h2>3. 提供丰富的环境</h2><p>留下互动玩具和益智游戏，分散狗狗的注意力。</p><h2>4. 保持冷静的离别和回家</h2><p>离开和回家时保持低调，避免过度情绪化的告别和问候。</p><h2>5. 考虑使用舒缓产品</h2><p>如雷霆衬衫或舒缓精油，可以帮助某些狗狗减轻焦虑。</p>',
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
      content: '<p>夏季高温可能对宠物造成严重健康风险，特别是中暑。以下是一些预防宠物中暑的重要方法。</p><h2>保持充足的水分</h2><p>确保您的宠物随时可以喝到新鲜、干净的水。在户外活动时也要携带水和便携式水碗。</p><h2>避免在高温时段外出</h2><p>尽量在早晨或傍晚气温较低时带宠物外出活动，避开中午和下午最热的时段。</p><h2>提供阴凉场所</h2><p>确保宠物有阴凉处可以休息，避免长时间暴露在阳光下。</p><h2>认识中暑症状</h2><p>过度喘息、口水增多、步态不稳、嗜睡或反应迟钝都可能是中暑的征兆，需要立即采取降温措施并就医。</p>',
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
      content: '<p>这是新手养宠必读的完整文章内容。在本篇文章中，我们将深入探讨如何根据您的生活方式、居住环境和家庭成员情况，来科学地选择一只最适合您的宠物伙伴。从狗狗的品种性格，到猫咪的独立性，再到小型宠物的特殊需求，我们将为您提供一份全面的决策指南，帮助您开启一段愉快且负责任的养宠旅程。</p>',
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
      content: '<p>猫咪是神秘而复杂的动物，它们通过各种肢体语言和行为来表达情绪和需求。本文将帮助您解读猫咪的常见行为。</p><h2>尾巴动作</h2><p>直立的尾巴表示友好和自信，而低垂或夹在腿间的尾巴则表示恐惧或焦虑。快速摇摆的尾巴通常表示警惕或烦躁。</p><h2>眼睛表达</h2><p>缓慢眨眼或半闭眼是表达信任和舒适的信号。瞳孔放大可能表示兴奋或恐惧，而瞳孔缩小则可能表示警惕或攻击性。</p><h2>耳朵姿势</h2><p>前倾的耳朵表示好奇和注意，而平贴在头部的耳朵则表示恐惧或攻击准备。</p><h2>声音沟通</h2><p>不同的叫声有不同的含义，从表示问候的轻柔"喵"声，到表示不满的低吼。理解这些声音可以帮助您更好地回应猫咪的需求。</p>',
      author: '宠爱猫咪专家',
      cover_image_url: '',
      published_at: '2023-07-28',
      created_at: '2023-07-28',
      imageName: 'cat-behavior.jpg'
    }
  ];
  
  // 根据ID查找文章
  const foundPost = staticPosts.find(p => p.id.toString() === postId.toString());
  
  if (foundPost) {
    post.value = foundPost;
  } else {
    console.error('文章未找到');
  }
  
  loading.value = false;
}

// 返回社区动态列表
const goBackToCommunity = () => {
  // 使用 router.back() 返回上一页，这样可以保持滚动位置
  router.back();
  // 如果没有历史记录（例如直接访问文章页面），则导航到社区页面
  setTimeout(() => {
    if (router.currentRoute.value.path.includes('/post/')) {
      router.push('/community');
    }
  }, 100);
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
        <img v-if="post.imageName" :src="getImageUrl(post.imageName)" :alt="post.title">
        <img v-else-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.title">
      </div>
      
      <div class="post-content" v-html="post.content"></div>
      
      <div class="post-footer">
        <button @click="goBackToCommunity" class="back-to-list">
          返回社区动态列表
        </button>
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
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
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