<template>
  <div class="category-page">
    <div class="page-header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" text>返回首页</el-button>
      <h1 v-if="category">{{ category.icon }} {{ category.name }}</h1>
      <p v-if="category" class="page-desc">{{ category.description }}</p>
    </div>

    <el-empty description="文档列表将在 Phase 3 实现，敬请期待">
      <template #image>
        <span style="font-size: 64px">🚧</span>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCategoryById } from '../api/category'

const route = useRoute()
const category = ref(null)

onMounted(async () => {
  try {
    const res = await getCategoryById(route.params.id)
    category.value = res.data
  } catch (err) {
    console.error('获取分类详情失败:', err)
  }
})
</script>

<style scoped>
.category-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  margin: 16px 0 8px;
}

.page-desc {
  color: #909399;
  font-size: 14px;
}
</style>
