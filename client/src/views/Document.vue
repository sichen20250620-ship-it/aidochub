<template>
  <div class="doc-page" v-loading="loading">
    <div class="doc-header" v-if="doc">
      <el-button @click="$router.push(`/category/${doc.categoryId}`)" :icon="ArrowLeft" text>
        返回{{ doc.category?.name }}
      </el-button>
      <h1 class="doc-title">{{ doc.title }}</h1>
      <div class="doc-meta">
        <el-tag size="small" effect="plain">{{ doc.category?.icon }} {{ doc.category?.name }}</el-tag>
        <span>{{ doc.uploader?.username }}</span>
        <span>{{ formatDate(doc.createdAt) }}</span>
        <span>{{ doc.viewCount }} 次阅读</span>
      </div>
    </div>

    <div class="doc-content" v-if="doc" v-html="doc.content"></div>

    <el-empty v-if="!loading && !doc" description="文档不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getDocumentById } from '../api/document'

const route = useRoute()
const doc = ref(null)
const loading = ref(true)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await getDocumentById(route.params.id)
    doc.value = res.data
  } catch {
    // handled
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.doc-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
  min-height: 400px;
}

.doc-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.doc-title {
  font-size: 28px;
  font-weight: 700;
  margin: 16px 0 12px;
  color: #303133;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.doc-content {
  line-height: 1.8;
  font-size: 15px;
  color: #303133;
}

.doc-content :deep(h1),
.doc-content :deep(h2),
.doc-content :deep(h3) {
  margin: 24px 0 12px;
  color: #303133;
}

.doc-content :deep(h1) { font-size: 24px; }
.doc-content :deep(h2) { font-size: 20px; }
.doc-content :deep(h3) { font-size: 17px; }

.doc-content :deep(p) {
  margin: 12px 0;
}

.doc-content :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #e6a23c;
}

.doc-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.doc-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.doc-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.doc-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.doc-content :deep(th),
.doc-content :deep(td) {
  border: 1px solid #ebeef5;
  padding: 8px 12px;
  text-align: left;
}

.doc-content :deep(th) {
  background: #f5f7fa;
}

.doc-content :deep(a) {
  color: #409eff;
}

.doc-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding: 12px 16px;
  margin: 16px 0;
  background: #f5f7fa;
  color: #606266;
}
</style>
