const express = require('express')

module.exports = (app) => {
  const router = express.Router()

  router.get('/secure', async (req, res, next) => {
    try {
      return res.status(200).send('ok')
    } catch (e) { return next(e) }
  })
  return router
}
