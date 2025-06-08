<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 服务类别
const serviceCategories = ref([
  { id: 'all', name: '全部' },
  { id: 'care', name: '宠物照顾' },
  { id: 'medical', name: '医疗服务' },
  { id: 'beauty', name: '美容服务' },
  { id: 'training', name: '训练服务' }
])

// 当前选中的类别
const activeCategory = ref('all')

// 搜索关键词
const searchKeyword = ref('')

// 静态服务数据
const allServices = ref([
  {
    id: 1,
    title: '宠物寄养',
    description: '为您的宠物提供温馨、安全的寄养环境，让您安心出行无忧。我们的专业团队将确保您的爱宠在您不在时得到最好的照顾。',
    price: '¥80-200/天',
    category: 'care',
    image: 'https://source.unsplash.com/random/300x200?pet+boarding'
  },
  {
    id: 2,
    title: '宠物健康检查',
    description: '由专业兽医团队提供全面的健康检查服务，包括体温、心率、呼吸、体重测量以及基础血液和尿液检测。',
    price: '¥150-300/次',
    category: 'medical',
    image: 'https://source.unsplash.com/random/300x200?vet+check'
  },
  {
    id: 3,
    title: '宠物美容洗护',
    description: '专业的宠物美容师为您的爱宠提供洗浴、修剪、梳理等全方位的美容服务，让您的宠物保持整洁清新。',
    price: '¥80-300/次',
    category: 'beauty',
    image: 'https://source.unsplash.com/random/300x200?pet+grooming'
  },
  {
    id: 4,
    title: '宠物基础训练',
    description: '针对各类宠物的基础服从训练，包括坐下、等待、行走等基本指令，帮助您的宠物养成良好习惯。',
    price: '¥120-200/课时',
    category: 'training',
    image: 'https://source.unsplash.com/random/300x200?dog+training'
  },
  {
    id: 5,
    title: '宠物上门喂养',
    description: '当您不在家时，我们的专业人员可以上门照顾您的宠物，提供喂食、清洁和陪伴服务。',
    price: '¥50-100/次',
    category: 'care',
    image: 'https://source.unsplash.com/random/300x200?pet+feeding'
  },
  {
    id: 6,
    title: '宠物疫苗接种',
    description: '为您的宠物提供必要的疫苗接种服务，预防常见疾病，保障宠物健康。',
    price: '¥80-300/针',
    category: 'medical',
    image: 'https://source.unsplash.com/random/300x200?pet+vaccine'
  },
  {
    id: 7,
    title: '宠物专业洗牙',
    description: '专业的宠物牙齿清洁服务，去除牙结石，预防口腔疾病，保持口气清新。',
    price: '¥200-500/次',
    category: 'medical',
    image: 'https://source.unsplash.com/random/300x200?pet+dental'
  },
  {
    id: 8,
    title: '宠物行为矫正',
    description: '针对宠物的各种不良行为，如乱叫、咬东西、乱排泄等，提供专业的行为矫正训练。',
    price: '¥300-600/课程',
    category: 'training',
    image: 'https://source.unsplash.com/random/300x200?pet+behavior'
  },
  {
    id: 9,
    title: '宠物造型设计',
    description: '根据宠物特点和主人喜好，提供个性化的造型设计服务，让您的爱宠更加独特。',
    price: '¥120-400/次',
    category: 'beauty',
    image: 'https://source.unsplash.com/random/300x200?pet+styling'
  }
])

// 过滤后的服务列表
const filteredServices = computed(() => {
  let result = allServices.value

  // 按类别过滤
  if (activeCategory.value !== 'all') {
    result = result.filter(service => service.category === activeCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(service => 
      service.title.toLowerCase().includes(keyword) || 
      service.description.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 切换类别
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
}
</script>

<template>
  <div class="services-page">
    <section class="services-header">
      <h1 class="page-title">服务列表</h1>
      <p class="page-description">为您的爱宠提供全方位专业服务</p>
    </section>
    
    <section class="services-filters">
      <div class="category-filter">
        <el-radio-group v-model="activeCategory" @change="changeCategory">
          <el-radio-button v-for="category in serviceCategories" :key="category.id" :label="category.id">
            {{ category.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="search-filter">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索服务..."
          clearable
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
      </div>
    </section>
    
    <section class="services-list">
      <el-empty v-if="filteredServices.length === 0" description="没有找到匹配的服务" />
      
      <el-row :gutter="30">
        <el-col v-for="service in filteredServices" :key="service.id" :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="service-card" shadow="hover">
            <div class="service-image">
              <img :src="service.image" :alt="service.title">
            </div>
            <div class="service-content">
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-description">{{ service.description }}</p>
              <div class="service-footer">
                <span class="service-price">{{ service.price }}</span>
                <el-button type="primary" size="small">预约服务</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
    
    <section class="services-contact">
      <div class="contact-card">
        <h2 class="contact-title">需要更多服务?</h2>
        <p class="contact-description">如果您没有找到所需的服务，或者有特殊需求，请联系我们的客服团队。</p>
        <el-button type="primary" size="large">联系客服</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.services-page {
  padding: 20px;
}

.services-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
}

.services-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.category-filter {
  flex: 1;
  min-width: 300px;
}

.search-filter {
  width: 300px;
}

.services-list {
  margin-bottom: 50px;
}

.service-card {
  height: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-image {
  height: 200px;
  overflow: hidden;
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

.service-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.service-title {
  font-size: 1.25rem;
  margin: 15px 0 10px;
  color: #333;
}

.service-description {
  flex: 1;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.service-price {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1rem;
}

.services-contact {
  margin-top: 50px;
}

.contact-card {
  background-color: #f5f7fa;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

.contact-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 15px;
}

.contact-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 25px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .services-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    width: 100%;
  }
}
</style> 