const Route  = require('../class/Route')
const config = require('../config/config')
const util   = require('../tools/util')
const logger = require('../tools/logger')

module.exports.writeFile = (filePath, content) => {
  util.writeFile(filePath, content)
  const relativeDirPath = filePath.replace(config.workspacePath, '')
  logger.appPrimary('[archivo]', `${relativeDirPath} ${logger.OK}`)
}

module.exports.updateFile = (filePath, content) => {
  util.removeFile(filePath)
  util.writeFile(filePath, content)
  const relativeDirPath = filePath.replace(config.workspacePath, '')
  logger.appPrimary('[archivo]', `${relativeDirPath} (modificado) ${logger.OK}`)
}

module.exports.removeFile = (filePath) => {
  util.removeFile(filePath)
  const relativeDirPath = filePath.replace(config.workspacePath, '')
  logger.appPrimary('[archivo]', `${relativeDirPath} (eliminado) ${logger.OK}`)
}

module.exports.copyFile = (sourcePath, targetPath) => {
  util.copyFile(sourcePath, targetPath, logger, config.workspacePath)
  const relativeDirPath = targetPath.replace(config.workspacePath, '')
  logger.appPrimary('[archivo]', `${relativeDirPath} ${logger.OK}`)
}

module.exports.rmdir = (dirPath) => {
  util.rmdir(dirPath)
  const relativeDirPath = dirPath.replace(config.workspacePath, '')
  logger.appPrimary('[carpeta]', `${relativeDirPath} (eliminado) ${logger.OK}`)
}

module.exports.mkdir = (dirPath) => {
  util.mkdir(dirPath)
  const relativeDirPath = dirPath.replace(config.workspacePath, '')
  logger.appPrimary('[carpeta]', `${relativeDirPath} ${logger.OK}`)
}

module.exports.copyDir = (sourcePath, targetPath) => {
  util.copyDir(sourcePath, targetPath, logger, config.workspacePath)
}

module.exports.existLine = (content, str) => {
  let result = false
  content.split('\n').forEach(line => { if (line.trim().indexOf(str) !== -1) result = true })
  return result
}

module.exports.getApp = (appPath) => {
  return new Promise((resolve, reject) => {
    process.env.NODE_ENV = 'test'
    const app = require(appPath)
    setTimeout(() => { return resolve(app) }, 2000)
  })
}

module.exports.routes = (app) => {
  const routes = {}
  updateRoutes(app._router.stack, routes)
  return routes
}

function updateRoutes (stack, routes, groupName = '') {
  for (let i in stack) {
    const item = stack[i]
    const routePath   = item.regexp ? item.regexp.toString().split('/^').pop().split('/?').shift().replace(/\\/g, '') : ''
    const routeMethod = item.route && item.route.stack && item.route.stack.length > 0 && item.route.stack[0].method ? item.route.stack[0].method.toLowerCase() : 'NULL'
    const newGroup = groupName + routePath
    if (routeMethod !== 'NULL' && routePath !== '') {
      const group = groupName || 'Default'
      const definedPath = item.route ? item.route.path : ''
      const fullPath = group === 'Default' ? definedPath : (group + definedPath)
      insertRoute(routes, group, routeMethod, fullPath)
    }
    if (routeMethod !== 'NULL' && routePath === '') {
      const group = groupName || 'Default'
      const definedPath = item.route ? item.route.path : '/'
      const fullPath = group === 'Default' ? definedPath : (group + definedPath)
      insertRoute(routes, group, routeMethod, fullPath)
    }
    if (item && item.handle && item.handle.stack) {
      updateRoutes(item.handle.stack, routes, newGroup)
    }
  }
}

function insertRoute (routes, groupName, routeMethod, fullPath) {
  const route = new Route()
  route.setGroup(groupName)
  route.setMethod(routeMethod)
  route.setPath(fullPath)
  if (!routes[route.groupKey]) { routes[route.groupKey] = [] }
  routes[route.groupKey].push(route)
}
