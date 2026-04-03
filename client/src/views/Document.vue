<template>
  <div class="doc-page" v-loading="loading">
    <div class="doc-header" v-if="doc">
      <div class="header-top">
        <el-button @click="$router.push(`/category/${doc.categoryId}`)" :icon="ArrowLeft" text>
          返回{{ doc.category?.name }}
        </el-button>
        <el-button
          :type="favorited ? 'warning' : 'default'"
          :icon="Star"
          round
          size="small"
          @click="handleToggleFavorite"
        >
          {{ favorited ? '已收藏' : '收藏' }}
        </el-button>
      </div>
      <h1 class="doc-title">{{ doc.title }}</h1>
      <div class="doc-meta">
        <el-tag size="small" effect="plain">{{ doc.category?.icon }} {{ doc.category?.name }}</el-tag>
        <span>{{ doc.uploader?.username }}</span>
        <span>{{ formatDate(doc.createdAt) }}</span>
        <span>{{ doc.viewCount }} 次阅读</span>
      </div>
    </div>

    <!-- HTML 内容渲染 -->
    <div class="doc-frame-wrap" v-if="doc">
      <iframe
        ref="docFrame"
        class="doc-frame"
        :srcdoc="doc.content"
        sandbox="allow-scripts allow-same-origin"
        @load="adjustFrameHeight"
      ></iframe>
    </div>

    <!-- 评论区 -->
    <div class="comment-section" v-if="doc">
      <h3 class="section-title">评论 ({{ comments.length }})</h3>

      <div class="comment-input">
        <el-input
          v-model="commentText"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          maxlength="500"
          show-word-limit
        />
        <el-button type="primary" size="small" :disabled="!commentText.trim()" @click="handleAddComment" style="margin-top: 8px;">
          发表评论
        </el-button>
      </div>

      <div class="comment-list">
        <div v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-header">
            <el-avatar :size="28">{{ c.user?.username?.charAt(0)?.toUpperCase() }}</el-avatar>
            <span class="comment-user">{{ c.user?.username }}</span>
            <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
            <el-button
              v-if="c.userId === userStore.user?.id || userStore.isAdmin"
              type="danger"
              size="small"
              text
              @click="handleDeleteComment(c.id)"
            >
              删除
            </el-button>
          </div>
          <div class="comment-body">{{ c.content }}</div>
        </div>
        <el-empty v-if="comments.length === 0" description="暂无评论" :image-size="60" />
      </div>
    </div>

    <el-empty v-if="!loading && !doc" description="文档不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDocumentById } from '../api/document'
import { checkFavorite, toggleFavorite } from '../api/favorite'
import { getComments, addComment, deleteComment } from '../api/comment'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()
const docId = Number(route.params.id)

const doc = ref(null)
const loading = ref(true)
const favorited = ref(false)
const comments = ref([])
const commentText = ref('')
const docFrame = ref()

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function adjustFrameHeight() {
  const iframe = docFrame.value
  if (!iframe) return
  try {
    const body = iframe.contentDocument?.body
    if (body) iframe.style.height = body.scrollHeight + 40 + 'px'
  } catch { /* ignore */ }
}

async function handleToggleFavorite() {
  const res = await toggleFavorite(docId)
  favorited.value = res.data.favorited
  ElMessage.success(res.message)
}

async function loadComments() {
  const res = await getComments(docId)
  comments.value = res.data
}

async function handleAddComment() {
  if (!commentText.value.trim()) return
  await addComment({ documentId: docId, content: commentText.value.trim() })
  commentText.value = ''
  ElMessage.success('评论成功')
  loadComments()
}

async function handleDeleteComment(id) {
  await deleteComment(id)
  ElMessage.success('已删除')
  loadComments()
}

onMounted(async () => {
  try {
    const [docRes, favRes] = await Promise.all([
      getDocumentById(docId),
      checkFavorite(docId)
    ])
    doc.value = docRes.data
    favorited.value = favRes.data.favorited
    loadComments()
  } catch { /* handled */ }
  finally { loading.value = false }
})
</script>

<style scoped>
.doc-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  min-height: 400px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.comment-section {
  margin-top: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.comment-input {
  margin-bottom: 24px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: auto;
}

.comment-body {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
