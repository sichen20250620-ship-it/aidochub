<template>
  <el-card class="category-card" shadow="hover" @click="goToCategory">
    <div class="card-icon">{{ category.icon }}</div>
    <div class="card-content">
      <h3 class="card-title">{{ category.name }}</h3>
      <p class="card-desc">{{ category.description }}</p>
      <div class="card-tags">
        <el-tag
          v-for="tag in category.tags"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="card-footer">
        <span class="doc-count">{{ category.docCount }} 篇文档</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function goToCategory() {
  router.push(`/category/${props.category.id}`)
}
</script>

<style scoped>
.category-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 12px;
}

.category-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.card-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 12px;
}

.card-tags {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.card-footer {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
