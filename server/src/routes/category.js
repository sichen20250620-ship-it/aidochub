const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')

// 获取所有知识分类
router.get('/', categoryController.getAll)

// 获取单个分类详情
router.get('/:id', categoryController.getById)

module.exports = router
