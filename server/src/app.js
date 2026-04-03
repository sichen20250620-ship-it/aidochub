const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const categoryRoutes = require('./routes/category')
const chatRoutes = require('./routes/chat')
const commentRoutes = require('./routes/comment')
const dashboardRoutes = require('./routes/dashboard')
const documentRoutes = require('./routes/document')
const favoriteRoutes = require('./routes/favorite')
const healthRoutes = require('./routes/health')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 路由
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/favorites', favoriteRoutes)

// 启动服务
app.listen(PORT, () => {
  console.log(`[AIDocHub] 服务已启动: http://localhost:${PORT}`)
})

module.exports = app
