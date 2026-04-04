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
        v-if="canUpload"
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
        <el-button v-if="canUpload" type="primary" @click="showUpload = true">
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

    <!-- 上传弹窗（支持拖拽 + 多文件） -->
    <el-dialog v-model="showUpload" title="上传文档" width="560px" @close="resetUpload">
      <el-upload
        ref="uploadRef"
        drag
        multiple
        :auto-upload="false"
        accept=".html,.htm"
        :on-change="handleFilesChange"
        :on-remove="handleFilesChange"
        :file-list="fileList"
        class="upload-area"
      >
        <div class="upload-drag-content">
          <el-icon class="el-icon--upload" :size="48"><Upload /></el-icon>
          <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
          <div class="el-upload__tip">支持 .html / .htm 文件，单文件不超过 20MB，一次最多 20 个</div>
        </div>
      </el-upload>

      <!-- 上传结果 -->
      <div v-if="uploadResult" class="upload-result">
        <el-alert
          :title="`上传完成：成功 ${uploadResult.success.length} 个，失败 ${uploadResult.errors.length} 个`"
          :type="uploadResult.errors.length ? 'warning' : 'success'"
          show-icon
          :closable="false"
        />
        <div v-if="uploadResult.errors.length" class="error-list">
          <div v-for="(err, i) in uploadResult.errors" :key="i" class="error-item">
            {{ err.filename }}: {{ err.error }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showUpload = false">{{ uploadResult ? '关闭' : '取消' }}</el-button>
        <el-button
          v-if="!uploadResult"
          type="primary"
          :loading="uploading"
          :disabled="selectedFiles.length === 0"
          @click="handleBatchUpload"
        >
          上传 {{ selectedFiles.length }} 个文件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Search, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryById } from '../api/category'
import { getDocuments, uploadDocumentBatch, deleteDocument } from '../api/document'
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

// 权限：admin 和 editor 可以上传
const canUpload = computed(() => ['admin', 'editor'].includes(userStore.user?.role))

// 上传相关
const showUpload = ref(false)
const uploading = ref(false)
const uploadRef = ref()
const fileList = ref([])
const selectedFiles = ref([])
const uploadResult = ref(null)

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
    // handled
  } finally {
    loading.value = false
  }
}

function handleFilesChange(file, list) {
  selectedFiles.value = list.map(f => f.raw).filter(Boolean)
}

function resetUpload() {
  fileList.value = []
  selectedFiles.value = []
  uploadResult.value = null
}

async function handleBatchUpload() {
  if (selectedFiles.value.length === 0) {
    return ElMessage.warning('请选择文件')
  }
  uploading.value = true
  try {
    const fd = new FormData()
    selectedFiles.value.forEach(file => fd.append('files', file))
    fd.append('categoryId', categoryId)

    const res = await uploadDocumentBatch(fd)
    uploadResult.value = res.data
    ElMessage.success(res.message)
    loadDocuments()
  } catch {
    // handled
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

.upload-area {
  width: 100%;
}

.upload-drag-content {
  padding: 20px 0;
}

.upload-result {
  margin-top: 16px;
}

.error-list {
  margin-top: 8px;
  font-size: 13px;
  color: #f56c6c;
}

.error-item {
  padding: 4px 0;
}

@media (max-width: 768px) {
  .category-page {
    padding: 12px;
  }

  .header-info h1 {
    font-size: 20px;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .doc-item {
    padding: 14px;
  }

  .doc-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
