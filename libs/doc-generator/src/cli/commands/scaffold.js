const path = require('path')
const _    = require('lodash')
const YAML = require('yamljs')

const config = require('../../config/config')
const cli    = require('../../tools/cli')
const util   = require('../../tools/util')
const logger = require('../../tools/logger')

module.exports = async function action (options) {
  logger.appTitle('Creando los archivos base ...')

  const app = await cli.getApp(config.appPath)
  const ROUTES = cli.routes(app)

  if (!util.isDir(config.testPath)) {
    cli.mkdir(config.testPath)
  }

  const keys = Object.keys(ROUTES)
  for (let i in keys) {
    const groupName = keys[i]
    const groupContent = ROUTES[groupName]
    for (let j in groupContent) {
      const route = groupContent[j]
      await _crearContenidoTest(route.groupKey, route)
    }
  }

  logger.appSuccess()
  logger.appSuccess(`info: `, `Tarea completada exitosamente :)`)
  logger.appSuccess()

  process.exit(0)
}

async function _crearContenidoTest (groupKey, route) {
  // Archivo TEST
  let TEST_BODY_PATH = path.resolve(config.templatePath, 'test-body.js')
  if (!util.isFile(TEST_BODY_PATH)) { TEST_BODY_PATH = path.resolve(__dirname, '../../template/test-body.js') }

  let content = util.readFile(TEST_BODY_PATH, 'utf-8')
  let filePath = path.resolve(config.testPath, `${groupKey}.test.js`)
  if (!util.isFile(filePath)) {
    content = _.replace(content, /GROUP/g, route.group)
    cli.writeFile(filePath, content)
  }

  const ROUTE_FLAG = '// <!-- [TEST DEFINITION] --!> //'
  content = util.readFile(filePath, 'utf-8')
  let TEST_BLOCK_PATH = path.resolve(config.templatePath, 'test-block.js')
  if (!util.isFile(TEST_BLOCK_PATH)) { TEST_BLOCK_PATH = path.resolve(__dirname, '../../template/test-block.js') }
  let newTestBlock = util.readFile(TEST_BLOCK_PATH, 'utf-8')
  newTestBlock = _.replace(newTestBlock, /GROUP/g, route.group)
  newTestBlock = _.replace(newTestBlock, /METHOD/g, route.method)
  newTestBlock = _.replace(newTestBlock, /PATH/g, route.path)
  newTestBlock = _.replace(newTestBlock, /KEY/g, route.key)
  const ROUTE_KEY = newTestBlock.split('\n')[0]
  if (!content.includes(ROUTE_KEY)) {
    content = content.replace(ROUTE_FLAG, newTestBlock)
    logger.appInfo('', ` [${groupKey}] - [${route.method}] ${route.path}`, logger.OK)
  }
  content = content.trim() + '\n'
  util.removeFile(filePath)
  util.writeFile(filePath, content)

  const existeRuta = (routes, routeMethod, routePath) => {
    for (let i in routes) {
      if (routes[i].method === routeMethod && routes[i].path === routePath) { return true }
    }
    return false
  }

  //  Archivo JSON
  if (config.helpersType === 'JSON') {
    filePath = path.resolve(config.helpersPath, `${groupKey}.json`)
    const JSON_STRING = util.isFile(filePath) ? util.readFile(filePath, 'utf-8') || '[]' : '[]'
    content = JSON.parse(JSON_STRING)
    if (!existeRuta(content, route.method, route.path)) {
      content.push({ method: route.method, path: route.path })
    }
    if (util.isFile(filePath)) { util.removeFile(filePath) }
    util.writeFile(filePath, JSON.stringify(content, null, 2) + '\n')
  }

  // Archivo YAML
  if (config.helpersType === 'YAML') {
    filePath = path.resolve(config.helpersPath, `${groupKey}.yml`)
    const YAML_STRING = util.isFile(filePath) ? util.readFile(filePath, 'utf-8') || '---\n' : '---\n'
    content = YAML.parse(YAML_STRING) || []
    if (!existeRuta(content, route.method, route.path)) {
      content.push({ method: route.method, path: route.path })
    }
    if (util.isFile(filePath)) { util.removeFile(filePath) }
    util.writeFile(filePath, YAML.stringify(content, 4))
  }
}
