const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AIDocHub API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
