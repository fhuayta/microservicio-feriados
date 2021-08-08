const supertest = require('supertest')

const Route         = require('./Route')
const RouteBuilder  = require('./RouteBuilder')

const config = require('../config/config')

class ApidocRequest {
  constructor () {
    this.route = new Route()
  }

  static init () {
    const app = require(config.appPath)
    const request = supertest(app)
    ApidocRequest.requestInstance = request
  }

  static get (routePath, routeKey) { return ApidocRequest._createRoute('get', routePath, routeKey) }
  static post (routePath, routeKey) { return ApidocRequest._createRoute('post', routePath, routeKey) }
  static put (routePath, routeKey) { return ApidocRequest._createRoute('put', routePath, routeKey) }
  static patch (routePath, routeKey) { return ApidocRequest._createRoute('patch', routePath, routeKey) }
  static delete (routePath, routeKey) { return ApidocRequest._createRoute('delete', routePath, routeKey) }

  static _createRoute (routeMethod, routePath, routeKey) {
    const routeBuilder = new RouteBuilder()
    routeBuilder.method(routeMethod).path(routePath).key(routeKey)
    const routeProperties = {
      requestInstance : ApidocRequest.requestInstance,
      request         : true
    }
    routeBuilder.updatePropertiesWithoutRequest(routeProperties)
    return routeBuilder
  }
}

module.exports = ApidocRequest
