<template>
  <div class="category-page">
    <div class="page-header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" text>返回首页</el-button>
      <div class="header-info" v-if="category">
        <h1>{{ category.icon }} {{ category.name }}</h1>
        <p class="page-desc">{{ category.description }}</p>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索文档..."
        :prefix-icon="Search"
        clearable
        class="search-box"
        @clear="loadDocuments"
        @keyup.enter="loadDocuments"
      />
      <el-button
        v-if="userStore.isAdmin"
        type="primary"
        :icon="Upload"
        @click="showUpload = true"
      >
        上传文档
      </el-button>
    </div>

    <!-- 文档列表 -->
    <div class="doc-list" v-loading="loading">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="doc-item"
        @click="$router.push(`/doc/${doc.id}`)"
      >
        <div class="doc-main">
          <h3 class="doc-title">{{ doc.title }}</h3>
          <p class="doc-summary">{{ doc.summary }}</p>
        </div>
        <div class="doc-meta">
          <span>{{ doc.uploader?.username }}</span>
          <span>{{ formatDate(doc.createdAt) }}</span>
          <span>{{ doc.viewCount }} 次阅读</span>
          <el-button
            v-if="userStore.isAdmin"
            type="danger"
            size="small"
            text
            @click.stop="handleDelete(doc)"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-empty v-if="!loading && documents.length === 0" description="暂无文档，等待上传">
        <el-button
          v-if="userStore.isAdmin"
          type="primary"
          @click="showUpload = true"
        >
          上传第一篇文档
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadDocuments"
      />
    </div>

    <!-- 上传弹窗 -->
    <el-dialog v-model="showUpload" title="上传文档" width="480px">
      <el-form label-width="80px">
        <el-form-item label="文档标题">
          <el-input v-model="uploadForm.title" placeholder="留空则自动提取 HTML 标题" />
        </el-form-item>
        <el-form-item label="HTML 文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".html,.htm"
            :on-change="handleFileChange"
          >
            <el-button type="primary" plain>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 .html / .htm 文件，不超过 20MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpload = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          确认上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Search, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryById } from '../api/category'
import { getDocuments, uploadDocument, deleteDocument } from '../api/document'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()
const categoryId = route.params.id

const category = ref(null)
const documents = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)

// 上传相关
const showUpload = ref(false)
const uploading = ref(false)
const uploadRef = ref()
const uploadForm = ref({ title: '', file: null })

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

async function loadDocuments() {
  loading.value = true
  try {
    const res = await getDocuments({
      categoryId,
      keyword: keyword.value,
      page: page.value,
      pageSize
    })
    documents.value = res.data.list
    total.value = res.data.total
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleFileChange(file) {
  uploadForm.value.file = file.raw
}

async function handleUpload() {
  if (!uploadForm.value.file) {
    return ElMessage.warning('请选择 HTML 文件')
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadForm.value.file)
    fd.append('categoryId', categoryId)
    if (uploadForm.value.title) {
      fd.append('title', uploadForm.value.title)
    }
    await uploadDocument(fd)
    ElMessage.success('上传成功')
    showUpload.value = false
    uploadForm.value = { title: '', file: null }
    loadDocuments()
  } catch {
    // handled by interceptor
  } finally {
    uploading.value = false
  }
}

async function handleDelete(doc) {
  await ElMessageBox.confirm(`确定删除「${doc.title}」？`, '提示', { type: 'warning' })
  await deleteDocument(doc.id)
  ElMessage.success('已删除')
  loadDocuments()
}

onMounted(async () => {
  try {
    const res = await getCategoryById(categoryId)
    category.value = res.data
  } catch {
    // handled
  }
  loadDocuments()
})
</script>

<style scoped>
.category-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-info h1 {
  font-size: 28px;
  margin: 16px 0 8px;
}

.page-desc {
  color: #909399;
  font-size: 14px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
}

.doc-list {
  min-height: 200px;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
