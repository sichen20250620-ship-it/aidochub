<template>
  <div class="admin-page">
    <h2 class="page-title">管理后台</h2>

    <el-tabs v-model="activeTab">
      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="users">
        <div class="tab-actions">
          <el-button type="primary" size="small" @click="showCreateUser = true">创建用户</el-button>
        </div>

        <el-table :data="users" stripe style="width: 100%">
          <el-table-column prop="employeeId" label="员工编号" width="100">
            <template #default="{ row }">{{ row.employeeId || '-' }}</template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role)" size="small">{{ roleLabel(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '正常' : '已禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="_count.documents" label="文档数" width="70" />
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-dropdown trigger="click" @command="(cmd) => handleRoleChange(row, cmd)" size="small">
                <el-button size="small" text type="primary">改角色</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="admin">管理员</el-dropdown-item>
                    <el-dropdown-item command="editor">编辑者</el-dropdown-item>
                    <el-dropdown-item command="user">普通用户</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                size="small" text
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" text @click="handleResetPassword(row)">重置密码</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 分类管理 -->
      <el-tab-pane label="分类管理" name="categories">
        <div class="tab-actions">
          <el-button type="primary" size="small" @click="openCategoryDialog()">新增分类</el-button>
        </div>

        <el-table :data="categories" stripe style="width: 100%">
          <el-table-column prop="icon" label="图标" width="60" />
          <el-table-column prop="id" label="ID" width="150" />
          <el-table-column prop="name" label="名称" width="150" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="docCount" label="文档数" width="80" />
          <el-table-column label="操作" width="140">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="openCategoryDialog(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="handleDeleteCategory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建用户弹窗 -->
    <el-dialog v-model="showCreateUser" title="创建用户" width="480px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="员工编号">
          <el-input v-model="userForm.employeeId" placeholder="如 EMP001" />
        </el-form-item>
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" placeholder="登录显示名" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="userForm.email" placeholder="谷歌邮箱" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="userForm.password" placeholder="初始密码，建议让员工登录后修改" />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="userForm.role">
            <el-radio value="user">普通员工</el-radio>
            <el-radio value="editor">运营团队</el-radio>
            <el-radio value="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateUser = false">取消</el-button>
        <el-button type="primary" @click="handleCreateUser">创建</el-button>
      </template>
    </el-dialog>

    <!-- 分类编辑弹窗 -->
    <el-dialog v-model="showCategoryDialog" :title="categoryForm.isEdit ? '编辑分类' : '新增分类'" width="480px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="ID" required v-if="!categoryForm.isEdit">
          <el-input v-model="categoryForm.id" placeholder="英文标识，如 ai-tools" />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="categoryForm.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="categoryForm.icon" placeholder="Emoji，如 🤖" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUserRole, updateUserStatus, resetUserPassword, createCategory, updateCategory, deleteCategory } from '../api/admin'
import { getCategories } from '../api/category'

const activeTab = ref('users')
const users = ref([])
const categories = ref([])

// 用户相关
const showCreateUser = ref(false)
const userForm = reactive({ employeeId: '', username: '', email: '', password: '', role: 'user' })

// 分类相关
const showCategoryDialog = ref(false)
const categoryForm = reactive({ id: '', name: '', icon: '📁', description: '', isEdit: false })

function roleLabel(role) {
  return { admin: '管理员', editor: '运营团队', user: '普通员工' }[role] || role
}

function roleTagType(role) {
  return { admin: 'danger', editor: 'warning', user: '' }[role] || ''
}

async function loadUsers() {
  const res = await getUsers()
  users.value = res.data
}

async function loadCategories() {
  const res = await getCategories()
  categories.value = res.data
}

async function handleCreateUser() {
  if (!userForm.email || !userForm.username || !userForm.password) {
    return ElMessage.warning('请填写必填项')
  }
  await createUser({ ...userForm })
  ElMessage.success('创建成���')
  showCreateUser.value = false
  Object.assign(userForm, { employeeId: '', username: '', email: '', password: '', role: 'user' })
  loadUsers()
}

async function handleRoleChange(row, role) {
  await updateUserRole(row.id, role)
  ElMessage.success('角色已更新')
  loadUsers()
}

async function handleToggleStatus(row) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'disabled' ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定${action}用户「${row.username}」？`, '提示', { type: 'warning' })
  await updateUserStatus(row.id, newStatus)
  ElMessage.success(`已${action}`)
  loadUsers()
}

async function handleResetPassword(row) {
  const { value } = await ElMessageBox.prompt(`为「${row.username}」设置新密码`, '重置密码', {
    inputPattern: /.{6,}/,
    inputErrorMessage: '密码至少6位'
  })
  await resetUserPassword(row.id, value)
  ElMessage.success('密码已重置')
}

function openCategoryDialog(row) {
  if (row) {
    Object.assign(categoryForm, { id: row.id, name: row.name, icon: row.icon, description: row.description, isEdit: true })
  } else {
    Object.assign(categoryForm, { id: '', name: '', icon: '📁', description: '', isEdit: false })
  }
  showCategoryDialog.value = true
}

async function handleSaveCategory() {
  if (!categoryForm.name) return ElMessage.warning('请填写名称')
  if (categoryForm.isEdit) {
    await updateCategory(categoryForm.id, { name: categoryForm.name, icon: categoryForm.icon, description: categoryForm.description })
  } else {
    if (!categoryForm.id) return ElMessage.warning('请填写 ID')
    await createCategory({ id: categoryForm.id, name: categoryForm.name, icon: categoryForm.icon, description: categoryForm.description })
  }
  ElMessage.success('保存成功')
  showCategoryDialog.value = false
  loadCategories()
}

async function handleDeleteCategory(row) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」？需要先移除该分类下的所有文档`, '提示', { type: 'warning' })
  await deleteCategory(row.id)
  ElMessage.success('已删除')
  loadCategories()
}

onMounted(() => {
  loadUsers()
  loadCategories()
})
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tab-actions {
  margin-bottom: 16px;
}
</style>
