const path    = require('path')
const express = require('express')
const cors    = require('cors')

const config = require('../../config/config')
const logger = require('../../tools/logger')

module.exports = async function action (options) {
  logger.appTitle('Ejecutando el servidor ...')

  const app = express()
  app.use(cors({
    origin                         : '*',
    methods                        : 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    preflightContinue              : true,
    'Access-Control-Allow-Headers' : '*'
  }))

  app.use(express.static(path.resolve(process.cwd(), config.serverPublic)))
  if (config.serverRedirect) {
    app.get('/', (req, res, next) => {
      res.redirect(config.serverRedirect)
    })
  }

  return app.listen(config.serverPort, () => {
    console.log(`\n \x1b[32minfo:\x1b[0m Servidor de documentación activo: http://localhost:${config.serverPort}\n`)
  })
}
