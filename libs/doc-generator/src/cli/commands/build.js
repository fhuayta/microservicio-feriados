const config = require('../../config/config')
const logger = require('../../tools/logger')
const util   = require('../../tools/util')

module.exports = async function action (options) {
  logger.appTitle('Generando apidoc ...')

  if (util.isDir(config.buildPath)) { await util.rmdir(config.buildPath) }

  await util.cmd(`./node_modules/.bin/ava ${config.testPath}/* --serial --verbose`, process.cwd())

  logger.appSuccess()
  logger.appSuccess(`info: `, `Tarea completada exitosamente :)`)
  logger.appSuccess()
}
