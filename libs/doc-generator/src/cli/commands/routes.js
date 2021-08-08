const _       = require('lodash')
const Table   = require('cli-table')

const config = require('../../config/config')
const logger = require('../../tools/logger')
const cli    = require('../../tools/cli')

module.exports = async function action (options) {
  logger.appTitle('Obteniendo rutas ...')

  const app = await cli.getApp(config.appPath)
  const routes = cli.routes(app)

  Object.keys(routes).forEach(groupName => {
    const group = routes[groupName].length > 0 ? routes[groupName][0].group : groupName
    let table = new Table({
      head: [`\x1b[32m\x1b[0m`, `\x1b[32m${group}\x1b[0m`]
    })
    routes[groupName].forEach(route => {
      const routeMethod = _.padEnd(route.method.toUpperCase(), 6, ' ')
      const routePath   = _.padEnd(route.path, 100, ' ')
      table.push([routeMethod, routePath])
    })
    console.log(table.toString())
  })

  logger.appSuccess()
  logger.appSuccess(`info: `, `Tarea completada exitosamente. :)`)
  logger.appSuccess()

  process.exit(0)
}
