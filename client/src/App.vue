<template>
  <el-container class="app-container">
    <AppHeader />
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
