<template>
  <el-header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">AIDocHub</span>
      </router-link>
      <span class="logo-subtitle">AI知识文档中台</span>
    </div>
    <div class="header-right">
      <el-input
        v-model="searchText"
        placeholder="搜索文档..."
        :prefix-icon="Search"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      />
      <router-link to="/chat" class="ai-btn">
        <el-button type="primary" round size="small">🤖 AI 问答</el-button>
      </router-link>
      <template v-if="userStore.isLoggedIn">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="28">{{ userStore.user?.username?.charAt(0)?.toUpperCase() }}</el-avatar>
            <span class="username">{{ userStore.user?.username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="dashboard">数据看板</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAdmin" command="admin">管理后台</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const searchText = ref('')
const userStore = useUserStore()
const router = useRouter()

function handleSearch() {
  if (searchText.value.trim()) {
    router.push({ path: '/search', query: { q: searchText.value.trim() } })
  }
}

function handleCommand(cmd) {
  if (cmd === 'profile') {
    router.push('/profile')
  } else if (cmd === 'dashboard') {
    router.push('/dashboard')
  } else if (cmd === 'admin') {
    router.push('/admin')
  } else if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  cursor: pointer;
}

.logo-icon {
  font-size: 24px;
}

.logo-subtitle {
  font-size: 13px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #303133;
}
</style>
