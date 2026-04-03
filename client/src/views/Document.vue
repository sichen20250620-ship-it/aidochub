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

    <!-- 用 iframe 渲染完整 HTML，保留原始样式 -->
    <div class="doc-frame-wrap" v-if="doc">
      <iframe
        ref="docFrame"
        class="doc-frame"
        :srcdoc="doc.content"
        sandbox="allow-scripts allow-same-origin"
        @load="adjustFrameHeight"
      ></iframe>
    </div>

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
const docFrame = ref()

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function adjustFrameHeight() {
  const iframe = docFrame.value
  if (!iframe) return
  try {
    const body = iframe.contentDocument?.body
    if (body) {
      iframe.style.height = body.scrollHeight + 40 + 'px'
    }
  } catch {
    // 跨域限制时忽略
  }
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  min-height: 400px;
}

.doc-header {
  margin-bottom: 24px;
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

.doc-frame-wrap {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
}

.doc-frame {
  width: 100%;
  min-height: 600px;
  border: none;
  display: block;
}
</style>
