const express = require('express')
const router = express.Router()
const documentController = require('../controllers/documentController')
const { authRequired, adminRequired, editorRequired } = require('../middleware/auth')
const upload = require('../middleware/upload')

// 文档列表（需登录）
router.get('/', authRequired, documentController.getList)

// 文档详情（需登录）
router.get('/:id', authRequired, documentController.getById)

// 上传文档（编辑者及以上）
router.post('/upload', authRequired, editorRequired, upload.single('file'), documentController.upload)

// 删除文档（管理员）
router.delete('/:id', authRequired, adminRequired, documentController.delete)

module.exports = router
