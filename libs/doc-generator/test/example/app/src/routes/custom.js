const express = require('express')

const { adminRouter } = require('./submodule')

module.exports = (app) => {
  const router = express.Router()

  router.get('/other/route', async (req, res, next) => {
    try {
      return res.status(200).json({ msg: 'ok' })
    } catch (e) { return next(e) }
  })

  router.use('/admin', adminRouter(app))

  router.get('/client', (req, res, next) => { res.status(200).send('ok') })

  return router
}
