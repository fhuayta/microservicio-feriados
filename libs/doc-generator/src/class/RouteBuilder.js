const _    = require('lodash')
const path = require('path')
const YAML = require('yamljs')

const ApidocCreator = require('./ApidocCreator')
const FieldCreator  = require('./FieldCreator')

const Route  = require('./Route')
const config = require('../config/config')
const util   = require('../tools/util')
const logger = require('../tools/logger')

class RouteBuilder {
  constructor () {
    this.route = new Route()
  }

  method (method) {
    this.route.setMethod(method)
    return this
  }

  path (routePath) {
    this.route.setPath(routePath)
    return this
  }

  name (name) {
    this.route.setName(name)
    return this
  }

  group (groupName) {
    this.route.setGroup(groupName)
    return this
  }

  loadHelp (groupName) {
    this.route.setGroup(groupName)
    const helpersProperties = _getPropertiesExtra(this.route)
    this.updatePropertiesWithoutRequest(helpersProperties)
    return this
  }

  description (description) {
    this.route.setDescription(description)
    return this
  }

  version (version) {
    this.route.setVersion(version)
    return this
  }

  permissions (permissions) {
    this.route.setPermissions(permissions)
    return this
  }

  request (value) {
    this.route.setRequest(value === true)
    return this
  }

  verified (value) {
    this.route.setVerified(value === true)
    return this
  }

  key (value) {
    this.route.setKey(value)
    return this
  }

  inputData (inputData) {
    this.route.setInputData(inputData)
    return this
  }

  outputData (outputData) {
    this.route.setOutputData(outputData)
    return this
  }

  inputExamples (inputExamples) {
    this.route.setInputExamples(inputExamples)
    return this
  }

  outputExamples (outputExamples) {
    this.route.setOutputExamples(outputExamples)
    return this
  }

  requestPath () {
    return this.route.requestPath()
  }

  requestSend () {
    return this.route.requestSend()
  }

  getRoute () {
    return this.route
  }

  get (property) {
    return this.route[property]
  }

  async _updatePropertiesWithRequest () {
    if (this.route.request === true) {
      const response = await this.route.createRequest()
      if (!response.error) {
        this.route.setOutputData(response.body)
        this.route.setVerified(true)
      }
      this.route.setResponseInstance(response)
    }

    if (this.route.inputData && !this.route.input) {
      this.route.setInput(FieldCreator.groupObj(this.route.inputData))
    }

    if (this.route.outputData && !this.route.output) {
      this.route.setOutput(FieldCreator.groupObj(this.route.outputData))
    }
  }

  async generate () {
    await this._updatePropertiesWithRequest()

    const outputTempPath = path.resolve(config.buildPath, `routes/${this.route.groupKey}`)

    let apidocContent = this._getApidocContent({ outputTempPath })
    let swaggerContent = this._getSwaggerContent({ outputTempPath })

    const apiRouter = ApidocCreator.router(route => {
      // APIDOC JS
      const newBlock = route.apidoc
      const newRouteKey = newBlock.split('\n')[2]
      if (apidocContent.includes(newRouteKey)) {
        // console.log(` \x1b[33m${_.padEnd(`[${route.method}]`, 9)} ${route.path} - ${route.group} (${route.name}) \u2715 Ya ha sido documentado\x1b[0m`)
      } else {
        apidocContent += newBlock
      }

      // SWAGGER
      swaggerContent.paths[route.apidocSwagger.path] = swaggerContent.paths[route.apidocSwagger.path] || {}
      if (swaggerContent.paths[route.apidocSwagger.path][route.apidocSwagger.method]) {
        return
      }
      if (this.route.verified || this.route.request) { route.apidocSwagger.content.summary = '<<< VERIFICADO >>>' }
      swaggerContent.paths[route.apidocSwagger.path][route.apidocSwagger.method] = route.apidocSwagger.content
    })
    apiRouter[this.route.method](this.route.path, this.route)

    this._generateApidocJS(apidocContent, { outputTempPath })
    this._generateSwagger(swaggerContent, { outputTempPath })
    return this.route.responseInstance
  }

  async execute (options = {}) {
    await this._updatePropertiesWithRequest()
    return this.route.responseInstance
  }

  _getApidocContent (options) {
    const filePath = path.resolve(options.outputTempPath, `${this.route.groupKey}.js`)
    let content = ''
    if (util.isFile(filePath)) {
      content = util.readFile(filePath)
    }
    return content
  }

  _getSwaggerContent (options) {
    const filePath = path.resolve(options.outputTempPath, `${this.route.groupKey}.json`)
    let content = {
      swagger : '2.0',
      info    : {
        description : config.apiDescription,
        version     : config.apiVersion,
        title       : config.apiName
      },
      host     : config.apiUrl.replace('http://', '').replace('https://', ''),
      basePath : '/',
      tags     : [],
      paths    : {},
      schemes  : ['http', 'https']
    }
    if (util.isFile(filePath)) {
      content = JSON.parse(util.readFile(filePath))
    }
    if (!util.toArray(content.tags, 'name').includes(this.route.group)) {
      content.tags.push({ name: this.route.group })
    }
    return content
  }

  _generateApidocJS (content, options) {
    const filePath = path.resolve(options.outputTempPath, `${this.route.groupKey}.js`)
    if (util.isFile(filePath)) {
      util.removeFile(filePath)
    }
    util.mkdir(path.dirname(filePath))
    util.writeFile(filePath, content)
  }

  _generateSwagger (content, options) {
    const filePath = path.resolve(options.outputTempPath, `${this.route.groupKey}.json`)
    if (util.isFile(filePath)) {
      util.removeFile(filePath)
    }
    util.mkdir(path.dirname(filePath))
    util.writeFile(filePath, JSON.stringify(content, null, 2))
  }

  updatePropertiesWithoutRequest (PROPS) {
    const route = this.route
    PROPS = PROPS || {}
    if (PROPS.group)       { route.setGroup(PROPS.group) }
    if (PROPS.key)         { route.setKey(PROPS.key) }
    if (PROPS.permissions) { route.setPermissions(PROPS.permissions) }
    if (PROPS.version)     { route.setVersion(PROPS.version) }
    if (PROPS.request)     { route.setRequest(PROPS.request) }

    if (PROPS.name)       { route.setName(PROPS.name) }
    if (!route.name) { route.setName(`[${route.method}] ${_toWords(route.path)}${route.key ? ` (${route.key})` : ''}`) }

    if (PROPS.description)       { route.setDescription(PROPS.description) }
    if (!route.description) { route.setDescription(route.name) }

    if (PROPS.inputData)      { route.setInputData(PROPS.inputData) }
    if (PROPS.outputData)     { route.setOutputData(PROPS.outputData) }
    if (PROPS.inputExamples)  { route.setInputExamples(PROPS.inputExamples) }
    if (PROPS.outputExamples) { route.setOutputExamples(PROPS.outputExamples) }

    if (PROPS.requestInstance)  { route.setRequestInstance(PROPS.requestInstance) }
    if (PROPS.responseInstance) { route.setResponseInstance(PROPS.responseInstance) }

    if (route.inputData && !route.input) {
      route.setInput(FieldCreator.groupObj(route.inputData))
    }

    if (route.outputData && !route.output) {
      route.setOutput(FieldCreator.groupObj(route.outputData))
    }
  }
}

function _toWords (text) {
  const split = text.split('/')
  let words = ''
  split.forEach(e => {
    words += _.upperFirst(_.deburr(e)) + ' '
  })
  return words.trim()
}

function _getPropertiesExtra (route) {
  if (config.helpersType === 'YAML') {
    return _getPropertiesFromYAML(route)
  }
  if (config.helpersType === 'JSON') {
    return _getPropertiesFromJSON(route)
  }
  return {}
}

function _getPropertiesFromJSON (route) {
  let routeJSON = null
  const JSON_ROUTE_PATH = path.resolve(config.helpersPath, `${route.groupKey}.json`)
  if (!util.isFile(JSON_ROUTE_PATH)) { return routeJSON }
  let routes = {}
  try {
    routes = util.isFile(JSON_ROUTE_PATH) ? require(JSON_ROUTE_PATH) : {}
  } catch (e) { logger.appError(`ERROR:`, `No se pudo cargar el archivo ${JSON_ROUTE_PATH.replace(process.cwd(), '')}`); throw e }
  routes.forEach(obj => {
    if (obj.method === route.method && obj.path === route.path && obj.key === route.key) { routeJSON = obj }
  })
  return routeJSON
}

function _getPropertiesFromYAML (route) {
  let routeYAML = null
  const YAML_ROUTE_PATH = path.resolve(config.helpersPath, `${route.groupKey}.yml`)
  if (!util.isFile(YAML_ROUTE_PATH)) { return routeYAML }
  let routes = []
  try {
    routes = YAML.load(YAML_ROUTE_PATH)
  } catch (e) { logger.appError(`ERROR:`, `No se pudo cargar el archivo ${YAML_ROUTE_PATH.replace(process.cwd(), '')}`); throw e }
  routes.forEach(obj => {
    if (obj.method === route.method && obj.path === route.path && obj.key === route.key) { routeYAML = obj }
  })
  return routeYAML
}

module.exports = RouteBuilder
