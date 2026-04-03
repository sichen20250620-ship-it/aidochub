<template>
  <div class="dashboard">
    <h2 class="page-title">数据看板</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :xs="12" :sm="6" v-for="item in statCards" :key="item.label">
        <div class="stat-card">
          <div class="stat-icon">{{ item.icon }}</div>
          <div class="stat-info">
            <div class="stat-num">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="content-row">
      <!-- 热门文档 -->
      <el-col :xs="24" :md="12">
        <div class="panel">
          <h3 class="panel-title">热门文档 Top 10</h3>
          <div class="doc-rank-list">
            <div
              v-for="(doc, idx) in hotDocs"
              :key="doc.id"
              class="rank-item"
              @click="$router.push(`/doc/${doc.id}`)"
            >
              <span :class="['rank-num', idx < 3 ? 'top' : '']">{{ idx + 1 }}</span>
              <span class="rank-title">{{ doc.title }}</span>
              <span class="rank-views">{{ doc.viewCount }} 阅读</span>
            </div>
            <el-empty v-if="hotDocs.length === 0" description="暂无数据" :image-size="48" />
          </div>
        </div>
      </el-col>

      <!-- 最近上传 -->
      <el-col :xs="24" :md="12">
        <div class="panel">
          <h3 class="panel-title">最近上传</h3>
          <div class="doc-rank-list">
            <div
              v-for="doc in recentDocs"
              :key="doc.id"
              class="rank-item"
              @click="$router.push(`/doc/${doc.id}`)"
            >
              <el-tag size="small" effect="plain" class="rank-cat">
                {{ doc.category?.icon }}
              </el-tag>
              <span class="rank-title">{{ doc.title }}</span>
              <span class="rank-views">{{ doc.uploader?.username }}</span>
            </div>
            <el-empty v-if="recentDocs.length === 0" description="暂无数据" :image-size="48" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStats, getHotDocs, getRecentDocs } from '../api/dashboard'

const stats = ref({})
const hotDocs = ref([])
const recentDocs = ref([])

const statCards = computed(() => [
  { icon: '📄', label: '文档总数', value: stats.value.docCount || 0 },
  { icon: '👥', label: '用户数', value: stats.value.userCount || 0 },
  { icon: '👁', label: '总阅读量', value: stats.value.totalViews || 0 },
  { icon: '💬', label: '评论数', value: stats.value.commentCount || 0 }
])

onMounted(async () => {
  const [statsRes, hotRes, recentRes] = await Promise.all([
    getStats(),
    getHotDocs(),
    getRecentDocs()
  ])
  stats.value = statsRes.data
  hotDocs.value = hotRes.data
  recentDocs.value = recentRes.data
})
</script>

<style scoped>
.dashboard {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.content-row {
  margin-top: 8px;
}

.panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.doc-rank-list {
  display: flex;
  flex-direction: column;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background 0.15s;
}

.rank-item:hover {
  background: #f5f7fa;
  margin: 0 -12px;
  padding: 10px 12px;
  border-radius: 6px;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #909399;
  flex-shrink: 0;
}

.rank-num.top {
  background: #409eff;
  color: #fff;
}

.rank-title {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-views {
  font-size: 12px;
  color: #c0c4cc;
  flex-shrink: 0;
}

.rank-cat {
  flex-shrink: 0;
}
</style>
