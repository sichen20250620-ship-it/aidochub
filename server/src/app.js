const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const categoryRoutes = require('./routes/category')
const healthRoutes = require('./routes/health')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 路由
app.use('/api/health', healthRoutes)
app.use('/api/categories', categoryRoutes)

// 启动服务
app.listen(PORT, () => {
  console.log(`[AIDocHub] 服务已启动: http://localhost:${PORT}`)
})

module.exports = app
