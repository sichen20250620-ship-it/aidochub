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
      />
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchText = ref('')
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

.search-input {
  width: 280px;
}
</style>
