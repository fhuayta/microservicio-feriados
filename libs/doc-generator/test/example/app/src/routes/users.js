const express = require('express')

module.exports = (app) => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    try {
      const fields = req.query.fields ? req.query.fields.split(',') : null
      const item1 = {}
      const item2 = {}
      if (!fields || fields.includes('id')) {
        item1.id = 1
        item2.id = 2
      }
      if (!fields || fields.includes('name')) {
        item1.name = 'John'
        item2.name = 'Doe'
      }
      if (!fields || fields.includes('user')) {
        item1.user = 'john'
        item2.user = 'doe'
      }
      if (!fields || fields.includes('pass')) {
        item1.pass = '123'
        item2.pass = 'abc'
      }
      const users = [item1, item2]
      return res.status(200).json({ finalizado: true, data: users })
    } catch (e) { return next(e) }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      if (parseInt(req.params.id) !== 100) {
        return res.status(404).json({ finalizado: false, mensaje: 'Registro no encontrado' })
      }
      const user = { id: req.params.id, name: 'John', user: 'admin', pass: '123' }
      return res.status(200).json({ finalizado: true, data: user })
    } catch (e) { return next(e) }
  })

  router.post('/', async (req, res, next) => {
    try {
      if (!req.body.name || !req.body.user || !req.body.pass) {
        return res.status(412).json({ finalizado: false, mensaje: 'Se requieren los campos: name, user y pass' })
      }
      const user = { id: 100, name: req.body.name || 'John', user: req.body.user || 'admin', pass: req.body.pass || '123' }
      return res.status(201).json({ finalizado: true, datos: user })
    } catch (e) { return next(e) }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const user = { id: req.params.id, name: req.body.name, user: req.body.user, pass: req.body.pass }
      return res.status(201).json({ finalizado: true, datos: user })
    } catch (e) { return next(e) }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      return res.status(200).json({ finalizado: true, datos: null })
    } catch (e) { return next(e) }
  })

  router.post('/bulk', async (req, res, next) => {
    try {
      const users = req.body
      let cnt = 1
      users.forEach(user => { user.id = cnt++ })
      return res.status(201).json({ finalizado: true, datos: users })
    } catch (e) { return next(e) }
  })

  return router
}
