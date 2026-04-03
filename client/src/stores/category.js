import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories } from '../api/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      const res = await getCategories()
      categories.value = res.data
    } catch (err) {
      console.error('获取分类失败:', err)
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, fetchCategories }
})
