<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <el-row :gutter="24">
      <!-- 左侧：用户信息 + 修改密码 -->
      <el-col :xs="24" :md="8">
        <div class="panel">
          <div class="user-card">
            <el-avatar :size="64">{{ userStore.user?.username?.charAt(0)?.toUpperCase() }}</el-avatar>
            <h3>{{ userStore.user?.username }}</h3>
            <p class="user-email">{{ userStore.user?.email }}</p>
            <el-tag size="small" :type="roleTagType">{{ roleLabel }}</el-tag>
            <p class="user-id" v-if="userStore.user?.employeeId">
              工号: {{ userStore.user.employeeId }}
            </p>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">修改密码</h3>
          <el-form :model="pwdForm" label-position="top">
            <el-form-item label="当前密码">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="输入当前密码" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="至少6位" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
            </el-form-item>
            <el-button type="primary" :loading="pwdLoading" @click="handleChangePassword">
              修改密码
            </el-button>
          </el-form>
        </div>
      </el-col>

      <!-- 右侧：我的收藏 + 最近文档 -->
      <el-col :xs="24" :md="16">
        <div class="panel">
          <h3 class="panel-title">我的收藏 ({{ favorites.length }})</h3>
          <div class="doc-list">
            <div
              v-for="doc in favorites"
              :key="doc.id"
              class="doc-item"
              @click="$router.push(`/doc/${doc.id}`)"
            >
              <div class="doc-main">
                <el-tag size="small" effect="plain">{{ doc.category?.icon }} {{ doc.category?.name }}</el-tag>
                <span class="doc-title">{{ doc.title }}</span>
              </div>
              <span class="doc-views">{{ doc.viewCount }} 阅读</span>
            </div>
            <el-empty v-if="favorites.length === 0" description="还没有收藏文档" :image-size="48" />
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">最新文档</h3>
          <div class="doc-list">
            <div
              v-for="doc in recentDocs"
              :key="doc.id"
              class="doc-item"
              @click="$router.push(`/doc/${doc.id}`)"
            >
              <div class="doc-main">
                <el-tag size="small" effect="plain">{{ doc.category?.icon }} {{ doc.category?.name }}</el-tag>
                <span class="doc-title">{{ doc.title }}</span>
              </div>
              <span class="doc-views">{{ doc.viewCount }} 阅读</span>
            </div>
            <el-empty v-if="recentDocs.length === 0" description="暂无文档" :image-size="48" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { changePassword, getHistory } from '../api/profile'

const userStore = useUserStore()
const favorites = ref([])
const recentDocs = ref([])
const pwdLoading = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const roleLabel = computed(() => {
  return { admin: '管理员', editor: '运营团队', user: '普通员工' }[userStore.user?.role] || ''
})

const roleTagType = computed(() => {
  return { admin: 'danger', editor: 'warning', user: '' }[userStore.user?.role] || ''
})

async function handleChangePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    return ElMessage.warning('请填写密码')
  }
  if (pwdForm.newPassword.length < 6) {
    return ElMessage.warning('新密码至少6位')
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    return ElMessage.warning('两次输入的新密码不一致')
  }

  pwdLoading.value = true
  try {
    await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    Object.assign(pwdForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
    // 修改成功后退出登录
    userStore.logout()
    window.location.href = '/login'
  } catch {
    // 错误已在拦截器处理
  } finally {
    pwdLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getHistory()
    favorites.value = res.data.favorites
    recentDocs.value = res.data.recentDocs
  } catch {
    // handled
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.user-card {
  text-align: center;
  padding: 16px 0;
}

.user-card h3 {
  margin: 12px 0 4px;
  font-size: 18px;
}

.user-email {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.user-id {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.doc-list {
  display: flex;
  flex-direction: column;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background 0.15s;
}

.doc-item:hover {
  background: #f5f7fa;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 6px;
}

.doc-item:last-child {
  border-bottom: none;
}

.doc-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-views {
  font-size: 12px;
  color: #c0c4cc;
  flex-shrink: 0;
}
</style>
