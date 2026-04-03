<template>
  <div class="search-page">
    <div class="search-header">
      <h2>搜索结果：「{{ keyword }}」</h2>
      <span class="result-count" v-if="!loading">共 {{ total }} 条结果</span>
    </div>

    <div class="doc-list" v-loading="loading">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="doc-item"
        @click="$router.push(`/doc/${doc.id}`)"
      >
        <div class="doc-main">
          <h3 class="doc-title">
            <el-tag size="small" effect="plain" class="cat-tag">
              {{ doc.category?.icon }} {{ doc.category?.name }}
            </el-tag>
            {{ doc.title }}
          </h3>
          <p class="doc-summary">{{ doc.summary }}</p>
        </div>
        <div class="doc-meta">
          <span>{{ doc.uploader?.username }}</span>
          <span>{{ new Date(doc.createdAt).toLocaleDateString('zh-CN') }}</span>
          <span>{{ doc.viewCount }} 次阅读</span>
        </div>
      </div>

      <el-empty v-if="!loading && documents.length === 0" description="未找到相关文档" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDocuments } from '../api/document'

const route = useRoute()
const keyword = ref(route.query.q || '')
const documents = ref([])
const total = ref(0)
const loading = ref(false)

async function doSearch() {
  if (!keyword.value) return
  loading.value = true
  try {
    const res = await getDocuments({ keyword: keyword.value })
    documents.value = res.data.list
    total.value = res.data.total
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (val) => {
  keyword.value = val || ''
  doSearch()
})

onMounted(doSearch)
</script>

<style scoped>
.search-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.search-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.search-header h2 {
  font-size: 22px;
}

.result-count {
  color: #909399;
  font-size: 14px;
}

.doc-item {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  border: 1px solid #ebeef5;
}

.doc-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.doc-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-summary {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
