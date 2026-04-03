<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">AI 知识文档中台</h1>
      <p class="hero-desc">
        集中管理 Claude Code、OpenClaw Agent、漫画生成等 AI 工具的使用文档与最佳实践
      </p>
    </div>

    <div class="category-section">
      <h2 class="section-title">知识分类</h2>
      <el-row :gutter="24" v-loading="categoryStore.loading">
        <el-col
          v-for="item in categoryStore.categories"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <CategoryCard :category="item" />
        </el-col>
      </el-row>

      <el-empty
        v-if="!categoryStore.loading && categoryStore.categories.length === 0"
        description="暂无分类数据"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCategoryStore } from '../stores/category'
import CategoryCard from '../components/CategoryCard.vue'

const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.hero {
  text-align: center;
  padding: 48px 0 36px;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 15px;
  color: #909399;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.category-section {
  margin-top: 12px;
}
</style>
