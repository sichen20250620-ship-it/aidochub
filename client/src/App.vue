<template>
  <el-container class="app-container">
    <AppHeader v-if="route.name !== 'Login'" />
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
