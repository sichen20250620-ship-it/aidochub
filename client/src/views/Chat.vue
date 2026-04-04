<template>
  <div class="chat-page">
    <div class="chat-header">
      <h2>AI 智能问答</h2>
      <p class="chat-desc">基于知识库文档，智能回答你的问题</p>
      <el-tag v-if="aiStatus" :type="aiStatus.available ? 'success' : 'danger'" size="small" effect="plain">
        {{ aiStatus.available ? aiStatus.provider + ' 已就绪' : 'AI 未配置' }}
      </el-tag>
    </div>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesRef">
      <div v-if="messages.length === 0" class="chat-welcome">
        <div class="welcome-icon">🤖</div>
        <h3>你好，我是 AIDocHub 智能助手</h3>
        <p>我可以基于知识库中的文档回答你的问题，试试问我：</p>
        <div class="suggestions">
          <el-button
            v-for="s in suggestions"
            :key="s"
            size="small"
            round
            @click="sendMessage(s)"
          >
            {{ s }}
          </el-button>
        </div>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" :class="['msg', msg.role]">
        <div class="msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="msg-body">
          <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
          <!-- 引用来源 -->
          <div class="msg-sources" v-if="msg.sources?.length">
            <span class="source-label">参考文档：</span>
            <router-link
              v-for="src in msg.sources"
              :key="src.id"
              :to="`/doc/${src.id}`"
              class="source-link"
            >
              {{ src.title }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="msg assistant">
        <div class="msg-avatar">🤖</div>
        <div class="msg-body">
          <div class="msg-content loading-dots">正在思考中</div>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="chat-input-wrap">
      <el-input
        v-model="inputText"
        placeholder="输入你的问题..."
        size="large"
        :disabled="loading"
        @keyup.enter="sendMessage()"
      >
        <template #append>
          <el-button
            :icon="Promotion"
            :loading="loading"
            @click="sendMessage()"
          />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { chatRequest, getAIStatus } from '../api/chat'

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messagesRef = ref()
const aiStatus = ref(null)

const suggestions = [
  'Claude Code 怎么安装使用？',
  'OpenClaw Agent 是什么？',
  '帮我总结一下知识库里有哪些文档'
]

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => {
    const el = messagesRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function sendMessage(text) {
  const question = text || inputText.value.trim()
  if (!question || loading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: question })
  scrollToBottom()

  loading.value = true

  // 构建历史（最近 6 轮）
  const history = messages.value
    .filter(m => m.role !== 'system')
    .slice(-7, -1)
    .map(m => ({ role: m.role, content: m.content }))

  try {
    const res = await chatRequest({ question, history })
    messages.value.push({
      role: 'assistant',
      content: res.data.answer,
      sources: res.data.sources
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content: '⚠️ AI 回答失败，请稍后重试'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

onMounted(async () => {
  try {
    const res = await getAIStatus()
    aiStatus.value = res.data
  } catch {
    // ignore
  }
})
</script>

<style scoped>
.chat-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.chat-header {
  text-align: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.chat-header h2 {
  font-size: 22px;
  margin-bottom: 4px;
}

.chat-desc {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.chat-welcome {
  text-align: center;
  padding: 60px 20px;
  color: #606266;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-welcome h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.chat-welcome p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}

.suggestions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.msg {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.msg.assistant .msg-avatar {
  background: #ecf5ff;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg.user .msg-content {
  background: #409eff;
  color: #fff;
  display: inline-block;
  padding: 10px 16px;
  border-radius: 12px 12px 0 12px;
  font-size: 14px;
  line-height: 1.6;
}

.msg.assistant .msg-content {
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 14px 18px;
  border-radius: 0 12px 12px 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
}

.msg-content :deep(code) {
  background: #f5f7fa;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 13px;
}

.msg.user .msg-content :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.msg-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.msg-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.msg-sources {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.source-link {
  color: #409eff;
  text-decoration: none;
  padding: 2px 8px;
  background: #ecf5ff;
  border-radius: 4px;
}

.source-link:hover {
  background: #d9ecff;
}

.loading-dots::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
}

.chat-input-wrap {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .chat-page {
    padding: 12px;
    height: calc(100vh - 80px);
  }

  .chat-header h2 {
    font-size: 18px;
  }

  .chat-welcome {
    padding: 30px 12px;
  }

  .suggestions {
    flex-direction: column;
    align-items: center;
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .msg {
    gap: 8px;
  }

  .msg.user .msg-content,
  .msg.assistant .msg-content {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
