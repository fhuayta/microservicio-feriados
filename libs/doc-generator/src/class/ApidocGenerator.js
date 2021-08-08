const _         = require('lodash')
const supertest = require('supertest')

const Route         = require('./Route')
const RouteBuilder  = require('./RouteBuilder')

const config = require('../config/config')

class ApidocGenerator {
  constructor () {
    this.route = new Route()
  }

  static globalProperties (routeProperties) {
    const app = require(config.appPath)
    const request = supertest(app)
    ApidocGenerator.requestInstance = request
    ApidocGenerator.routeProperties = routeProperties
  }

  static get (routePath, routeKey) { return ApidocGenerator._createRoute('get', routePath, routeKey) }
  static post (routePath, routeKey) { return ApidocGenerator._createRoute('post', routePath, routeKey) }
  static put (routePath, routeKey) { return ApidocGenerator._createRoute('put', routePath, routeKey) }
  static patch (routePath, routeKey) { return ApidocGenerator._createRoute('patch', routePath, routeKey) }
  static delete (routePath, routeKey) { return ApidocGenerator._createRoute('delete', routePath, routeKey) }

  static _createRoute (routeMethod, routePath, routeKey) {
    const routeBuilder = new RouteBuilder()
    routeBuilder.method(routeMethod).path(routePath).key(routeKey)
    const routeProperties = _.clone(ApidocGenerator.routeProperties)
    routeProperties.requestInstance = ApidocGenerator.requestInstance

    routeBuilder.updatePropertiesWithoutRequest(routeProperties)
    routeBuilder.loadHelp(routeBuilder.route.groupKey)
    return routeBuilder
  }
}

module.exports = ApidocGenerator
