const _ = require('lodash')

class Route {
  constructor () {
    this.method      = 'get'
    this.path        = '/'       // Ej.: /api/v1/users/:id
    this.group       = 'Default' // Ej.: Api V1 Users
    this.groupKey    = 'default' // Ej.: api-v1-users
    this.version     = 1
    this.name        = null      // Ej.: Devuelve una lista de usuarios
    this.key         = null      // Ej.: admin
    this.description = null
    this.permissions = null      // Ej.: ['admin', 'user']
    this.input       = null      // FieldGroup
    this.output      = null      // FieldGroup
    this.inputData   = null      // Datos de entrada obj = { headers, params, query, body }
    this.outputData  = null      // Datos de salida obj = body
    this.request     = false     // Indica si se va a aejecutar la petición
    this.verified    = false     // Indica si la ruta ha sido verificada con una consulta
    this.inputExamples  = null   // Lista de ejemplos de entrada Ej: [{ title, data }]
    this.outputExamples = null   // Lista de ejemplos de salida
    this.requestInstance  = null // Objeto creado con supertest para realizar consultas
    this.responseInstance = null // Resultado de la consulta
  }

  setName (name) {
    this.name = name
  }

  setGroup (groupName) {
    this.group    = _toWords(groupName)
    this.groupKey = _toKebab(this.group)
  }

  setVersion (version) {
    this.version = version
  }

  setKey (key) {
    this.key = key
  }

  setDescription (description) {
    this.description = description
  }

  setPersmissions (persmissions) {
    this.persmissions = persmissions
  }

  setMethod (method) {
    this.method = method
  }

  setPath (routePath) {
    this.path = routePath
  }

  setInputData (inputData) {
    if (typeof inputData !== 'undefined') {
      if (inputData === null) { this.inputData = null }
      if (inputData && typeof inputData.headers !== 'undefined') { this.inputData = this.inputData || {}; this.inputData.headers = inputData.headers }
      if (inputData && typeof inputData.params  !== 'undefined') { this.inputData = this.inputData || {}; this.inputData.params = inputData.params }
      if (inputData && typeof inputData.query   !== 'undefined') { this.inputData = this.inputData || {}; this.inputData.query = inputData.query }
      if (inputData && typeof inputData.body    !== 'undefined') { this.inputData = this.inputData || {}; this.inputData.body = inputData.body }
    }
  }

  setOutputData (outputData) {
    this.outputData = outputData
  }

  setInput (input) {
    this.input = input
  }

  setOutput (output) {
    this.output = output
  }

  setRequest (value) {
    this.request = value
  }

  setVerified (value) {
    this.verified = value
  }

  setInputExamples (inputExamples) {
    this.inputExamples = inputExamples
  }

  setOutputExamples (outputExamples) {
    this.outputExamples = outputExamples
  }

  setRequestInstance (requestInstance) {
    this.requestInstance = requestInstance
  }

  setResponseInstance (responseInstance) {
    this.responseInstance = responseInstance
  }

  swaggerPath () {
    const split = this.path.split('/')
    const path2 = []
    split.forEach(prop => {
      path2.push(prop.startsWith(':') ? `{${prop.substr(1)}}` : prop)
    })
    const swaggerPath = `/${_.trim(path2.join('/'), '/')}${this.path.endsWith('/') ? '/' : ''}`
    return swaggerPath
  }

  requestPath () {
    let requestPath = this.path
    if (this.inputData && this.inputData.params) {
      Object.keys(this.inputData.params).forEach(prop => {
        requestPath = requestPath.replace(`:${prop}`, `${this.inputData.params[prop]}`)
      })
    }
    if (this.inputData && this.inputData.query) {
      requestPath += '?'
      Object.keys(this.inputData.query).forEach(prop => {
        requestPath += `${prop}=${this.inputData.query[prop]}&`
      })
    }
    return _.trim(requestPath, '&')
  }

  createRequest () {
    let req = this.requestInstance[this.method](this.requestPath())
    if (this.inputData && this.inputData.body) {
      req = req.send(this.inputData.body)
    }
    if (this.inputData && this.inputData.headers) {
      const headers = this.inputData.headers
      const headersKey = Object.keys(headers)
      for (let prop in headersKey) {
        const headerKey = headersKey[prop]
        req = req.set(headerKey, headers[headerKey])
      }
    }
    return req
  }

  getId () {
    return `[${this.group}] [${this.method}] ${this.path}${this.key ? ` ${this.key}` : ''}`
  }
}

function _toWords (text) {
  text = _.replace(text, /-/g, '/')
  const split = text.split('/')
  let words = ''
  split.forEach(e => {
    words += _.upperFirst(_.deburr(e)) + ' '
  })
  return words.trim()
}

function _toKebab (text) {
  const kebab = _.trim(text.toLowerCase().split(' ').join('-'), '-')
  return kebab.trim()
}

module.exports = Route
