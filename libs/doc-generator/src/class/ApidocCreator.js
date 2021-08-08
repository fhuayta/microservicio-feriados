
/** @ignore */ const _ = require('lodash')

/**
* @ignore
* Crea la documentación de un servicio.
*/
class ApidocCreator {
  /**
  * Devuelve un objeto que permite crear la documentación de una ruta, con la
  * opción de ejecutar una función cuando la crea.
  * @param {Function} [onCreate] - Función de tipo (route, apidoc) => { } que se ejecuta cuando se crea una ruta.
  * @return {Object}
  * @example
  * const onCreate = (route, apidoc) => {
  *   console.log(route)
  *   console.log(apidoc)
  * }
  */
  static router (onCreate) {
    return {
      get    : (path, properties) => { properties.method = 'get';    properties.path = path; _route(properties, onCreate) },
      post   : (path, properties) => { properties.method = 'post';   properties.path = path; _route(properties, onCreate) },
      put    : (path, properties) => { properties.method = 'put';    properties.path = path; _route(properties, onCreate) },
      patch  : (path, properties) => { properties.method = 'patch';  properties.path = path; _route(properties, onCreate) },
      delete : (path, properties) => { properties.method = 'delete'; properties.path = path; _route(properties, onCreate) }
    }
  }
}

/**
* @ignore
* Crea el apidoc para una ruta.
* @param {!Object}  properties - Propiedades de la ruta.
* @param {Function} [onCreate] - Función que se ejecuta cuando se encuentra una ruta.
*/
function _route (properties, onCreate) {
  properties.method      = properties.method.toLowerCase()
  properties.name        = properties.name        || `[${properties.method}] ${properties.path}`
  properties.group       = properties.group       || 'API'
  properties.description = properties.description || properties.name
  properties.version     = properties.version     || 1
  const INPUT = {
    headers : properties.input ? properties.input.headers || {} : {},
    params  : properties.input ? properties.input.params  || {} : {},
    query   : properties.input ? properties.input.query   || {} : {},
    body    : properties.input ? properties.input.body    || {} : {}
  }
  const OUTPUT = properties.output || {}
  properties.input  = INPUT
  properties.output = OUTPUT

  let apidoc        = _header(properties)
  let apidocSwagger = _headerSwagger(properties)

  apidoc += _createApidoc('', INPUT.headers, '@apiHeader', 'Datos de entrada - headers')
  apidoc += _createApidoc('', INPUT.params,  '@apiParam',  'Datos de entrada - params')
  apidoc += _createApidoc('', INPUT.query,   '@apiParam',  'Datos de entrada - query')
  apidoc += _createApidoc('', INPUT.body,    '@apiParam',  'Datos de entrada - body')

  apidocSwagger.content.parameters = []
  if (INPUT.headers && Object.keys(INPUT.headers).length > 0) {
    const HEADERS_PARAM = _createApidocSwagger('', INPUT.headers, '@apiHeader', 'Datos de entrada - headers')
    Object.keys(HEADERS_PARAM).forEach(k => {
      HEADERS_PARAM[k].in = 'header'
      HEADERS_PARAM[k].name = k
      apidocSwagger.content.parameters.push(HEADERS_PARAM[k])
    })
  }
  if (INPUT.params && Object.keys(INPUT.params).length > 0) {
    const PATH_PARAM = _createApidocSwagger('', INPUT.params, '@apiParam', 'Datos de entrada - params')
    Object.keys(PATH_PARAM).forEach(k => {
      PATH_PARAM[k].in = 'path'
      PATH_PARAM[k].name = k
      apidocSwagger.content.parameters.push(PATH_PARAM[k])
    })
  }
  if (INPUT.query && Object.keys(INPUT.query).length > 0) {
    const PARAM = { in: 'query', name: 'query', description: 'Datos de entrada de la query' }
    const PROPERTIES = _createApidocSwagger('', INPUT.query, '@apiParam', 'Datos de entrada - body')
    const SCHEMA = (PROPERTIES.type) ? PROPERTIES : { type: 'object', properties: PROPERTIES }
    PARAM.schema = SCHEMA
    apidocSwagger.content.parameters.push(PARAM)
  }
  if (INPUT.body && Object.keys(INPUT.body).length > 0) {
    const PARAM = { in: 'body', name: 'body', description: 'Datos de entrada del body' }
    const PROPERTIES = _createApidocSwagger('', INPUT.body, '@apiParam', 'Datos de entrada - body')
    const SCHEMA = (PROPERTIES.type) ? PROPERTIES : { type: 'object', properties: PROPERTIES }
    PARAM.schema = SCHEMA
    apidocSwagger.content.parameters.push(PARAM)
  }

  apidocSwagger.content.responses = {}
  if (OUTPUT && Object.keys(OUTPUT).length > 0) {
    const PROPERTIES = _createApidocSwagger('', OUTPUT, '@apiSuccess', 'Respuesta - body')
    const SCHEMA = (PROPERTIES.type) ? PROPERTIES : { type: 'object', properties: PROPERTIES }
    const RESPONSE = { description: 'Resultado exitoso', schema: SCHEMA }
    apidocSwagger.content.responses['200'] = RESPONSE
  }

  if (INPUT.body && ((Object.keys(INPUT.body).length > 0) || (Array.isArray(INPUT.body)))) {
    const example = _example(INPUT.body)
    apidoc += `* @apiParamExample {json} Ejemplo Petición \n${example}`
  }
  if (properties.inputExamples) {
    properties.inputExamples.forEach(inputExample => {
      const example = _customExample(inputExample.data)
      apidoc += `* @apiParamExample {json} ${inputExample.title}\n${example}`
    })
  }
  if (properties.sampleRequest) {
    apidoc += `* @apiSampleRequest ${properties.sampleRequest}\n`
  }
  apidoc += _createApidoc('', OUTPUT, '@apiSuccess', 'Respuesta - body')
  if (OUTPUT && ((Object.keys(OUTPUT).length > 0) || (Array.isArray(OUTPUT)))) {
    const example = _example(OUTPUT)
    apidoc += `* @apiSuccessExample {json} Respuesta Exitosa\n${example}`
  }
  if (properties.outputExamples) {
    properties.outputExamples.forEach(outputExample => {
      const example = _customExample(outputExample.data)
      apidoc += `* @apiSuccessExample {json} ${outputExample.title}\n${example}`
    })
  }
  apidoc += `*/\n`
  properties.apidoc = apidoc
  properties.apidocSwagger = apidocSwagger
  if (onCreate) { onCreate(properties, apidoc) }
}

/**
* @ignore
* Crea un ejemplo para el apidoc.
* @param {Object} obj - Objeto que contiene los campos.
* @return {String}
*/
function _example (obj) {
  let result = ''
  let example = JSON.stringify(_createData(obj, false), null, 2)
  example.split('\n').forEach(line => {
    result += `* ${line}\n`
  })
  return result
}

/**
* @ignore
* Crea un ejemplo personalizado para el apidoc.
* @param {Object} obj - Objeto de ejemplo.
* @return {String}
*/
function _customExample (obj) {
  let result = ''
  const example = JSON.stringify(obj, null, 2)
  example.split('\n').forEach(line => {
    result += `* ${line}\n`
  })
  return result
}

/**
* @ignore
* Crea el encabezado del apidoc.
* @param {Object} route - Propiedades de la ruta.
* @return {String}
*/
function _header (route) {
  let content = '\n/**\n'
  content += `* @api {${route.method}} ${route.path} ${route.name}\n`
  content += `* @apiName ${route.name}\n`
  content += `* @apiGroup ${route.group}\n`
  content += `* @apiDescription ${route.description}\n`
  content += `* @apiVersion ${route.version}.0.0\n`
  let define = ``
  if (route.permissions) {
    route.permissions.forEach(permission => {
      define += `\n/**\n`
      define += `* @apiDefine ${permission} Rol: ${permission.toUpperCase()}\n`
      define += `* Solo los usuarios que tengan este rol pueden acceder al recurso.\n`
      define += `*/\n`
      content += `* @apiPermission ${permission}\n`
    })
  }
  return define + content
}

function _headerSwagger (route) {
  let description = route.description
  if (route.permissions) {
    description = `<strong>PERMISOS:</strong> <code>${route.permissions}</code><br><br>${description}`
  }
  const swaggerDefinition = {
    path    : route.swaggerPath(),
    method  : route.method,
    content : {
      tags        : [route.group],
      responses   : { '200': { description: route.description } },
      consumes    : [ 'application/json' ],
      produces    : [ 'application/json' ],
      description : description
    }
  }
  if (route.permissions) {
    swaggerDefinition.content.security = [{}]
  }
  return swaggerDefinition
}

/**
* @ignore
* Crea los campos del apidoc
* @param {String} fullprop       - Ruta completa del campo.
* @param {Object} obj            - Objeto que contiene los campos.
* @param {String} apidocProperty - Tipo de campo a documentar.
* @param {String} type           - Tipo de campo.
* @return {String}
*/
function _createApidoc (fullprop, obj, apidocProperty, type) {
  let apidoc = ''
  if (Array.isArray(obj)) {
    if (fullprop !== '') {
      apidoc += `* ${apidocProperty} (${type}) {Object[]} ${fullprop} Lista de objetos **${fullprop}**\n`
    }
    apidoc += _createApidoc(fullprop, obj[0], apidocProperty, type)
    return apidoc
  } else {
    if (fullprop !== '') {
      apidoc += `* ${apidocProperty} (${type}) {Object} ${fullprop} Datos del objeto **${fullprop}**\n`
    }
    for (let prop in obj) {
      const field    = obj[prop]
      const property = (fullprop !== '') ? `${fullprop}.${prop}` : prop
      if (_isField(field)) {
        const ONLY_TYPE           = apidocProperty === '@apiSuccess'
        const description         = _createDescription(field, prop)
        const validateDescription = _createValidateDescription(field, ONLY_TYPE)
        let fieldName = ONLY_TYPE ? `${property}` : _apidocProp(field, property)
        let fieldType = _apidocType(field, true) // es true, porque siempre se mostrará solamente el tipo de dato.
        apidoc += `* ${apidocProperty} (${type}) {${fieldType}} ${fieldName} ${description} ${validateDescription}\n`
      } else {
        if (typeof field === 'object') {
          apidoc += _createApidoc(property, obj[prop], apidocProperty, type)
        }
      }
    }
  }
  return apidoc
}

function _createApidocSwagger (fullprop, obj, apidocProperty, type, propName = '') {
  if (!obj) {
    return { type: 'object', properties: {}, example: null };
  }
  let apidoc = {}
  if (Array.isArray(obj)) {
    apidoc.type = 'array'
    const PROPS = _createApidocSwagger(fullprop, obj[0], apidocProperty, type, propName)
    if (Object.keys(PROPS).length > 0) {
      apidoc.items = { type: 'object', properties: PROPS }
    } else {
      apidoc.items = { type: 'string' }
    }
    return apidoc
  } else {
    for (let prop in obj) {
      const field    = obj[prop]
      const property = (fullprop !== '') ? `${fullprop}.${prop}` : prop
      if (_isField(field)) {
        let fieldType = _apidocType(field, true) // es true, porque siempre se mostrará solamente el tipo de dato.
        apidoc[prop] = { type: _toTypeSwager(fieldType), example: _exampleData(field) }
      } else {
        if (typeof field === 'object') {
          const PROPERTIES = _createApidocSwagger(property, obj[prop], apidocProperty, type, prop)
          if (PROPERTIES.type) {
            apidoc[prop] = PROPERTIES
          } else {
            apidoc[prop] = { type: 'object', properties: PROPERTIES }
          }
        }
      }
    }
  }
  return apidoc
}

function _toTypeSwager (type) {
  switch (type) {
    case 'String': return 'string'
    case 'Integer': return 'number'
    case 'Boolean': return 'boolean'
  }
  return 'string'
}

/**
* @ignore
* Devuelve la descripción de un campo.
* @param {Object} field      - Atributo.
* @param {String} fieldName  - Nombre del campo.
* @return {String}
*/
function _createDescription (field, fieldName) {
  if (field.comment)   { return field.comment }
  if (field.xlabel)    { return field.xlabel }
  return _.upperFirst(_.replace(fieldName, /_/g, ' ').trim())
}

/**
* @ignore
* Devuelve la descripción del validador de un campo, en formato HTML.
* @param {Object} field      - Atributo.
* @param {boolean} onlyType  - Indica si solo se devolverá el tipo o se
*                              incluirán algunos detalles más específicos.
* @return {String}
*/
function _createValidateDescription (field, onlyType) {
  _normalizeValidate(field)
  if (!onlyType && field.validate && Object.keys(field.validate).length > 0) {
    let vals = ''
    Object.keys(field.validate).forEach(key => {
      let value = field.validate[key].args
      if (typeof value === 'undefined') { value = 'true' }
      vals += `, <strong>${key}: </strong><code>${value}</code>`
    })
    return `<br>${vals.substr(2)}`
  }
  return ''
}

/**
* @ignore
* Devuelve el formato del nombre del campo, según si es requerido o no.
* @param {Object} field - Atributo
* @param {String} prop  - Nombre completo del campo.
* @return {String}
*/
function _apidocProp (field, prop) {
  prop = (typeof field.defaultValue !== 'undefined') ? `${prop}=${field.defaultValue}` : prop
  return (field.allowNull === false) ? prop : `[${prop}]`
}

/**
* @ignore
* Devuelve el formato tipo del campo, según el tipo de dato.
* @param {Object}  field    - Atributo
* @param {boolean} onlyType - Indica si solo se devolverá el tipo o se
*                             incluirán algunos detalles más específicos.
* @return {String}
*/
function _apidocType (field, onlyType) {
  const IS_ARRAY = field.type.key === 'ARRAY'
  const TYPE     = IS_ARRAY ? field.type.type : field.type
  const TYPE_STR = `${_.upperFirst(_.lowerCase(TYPE.key))}${IS_ARRAY ? '[]'  : ''}`
  if (!onlyType) {
    if (TYPE.key === 'ENUM' && typeof TYPE.values !== 'undefined') {
      return `${TYPE_STR}=${TYPE.values.toString()}`
    }
  }
  return TYPE_STR
}

/**
* @ignore
* Normaliza la propiedad validate.
* @param {Object} field Atributo de un modelo sequelize.
*/
function _normalizeValidate (field) {
  if (field.validate) {
    Object.keys(field.validate).forEach(key => {
      let validateItem = field.validate[key]
      if (typeof validateItem === 'function') { return }
      // Adiciona la propiedad args, si el validador no lo tuviera.
      // Ejemplo:    min: 10   ->   min: { args: 10 }           isInt: true    ->    isInt: { args: true }
      if ((typeof validateItem !== 'object') || (typeof validateItem.args === 'undefined')) {
        field.validate[key] = { args: validateItem }
      }
      // Convierte los validadores booleanos:    isInt: { args: true }   ->    isInt: true
      // Sequelize no admite validateKey: { args: true }, es por eso que si existe, ésta se elimina.
      if (typeof field.validate[key].args === 'boolean') {
        delete field.validate[key].args
        if (typeof field.validate[key].msg === 'undefined') {
          field.validate[key] = true
        }
      }
      // Corrige el problema cuando se declaran args con valores de 0 y 1.
      // Se corrige porque Sequelize los toma como valores booleanos, cuando debería tomarlos como números enteros.
      // Ejemplo:     min: { args: 0 }  ->   min: { args: [0] }    y   min: { args: 1 }  ->   min: { args: [1] }
      if ((typeof field.validate[key].args !== 'undefined') && ((field.validate[key].args === 0) || (field.validate[key].args === 1))) {
        field.validate[key].args = [field.validate[key].args]
      }
    })
  }
}

/**
* @ignore
* Crea un objeto para representar un ejemplo de la ruta.
* @param {Object}  obj          - Objeto con todos los campos.
* @param {boolean} onlyRequired - Indica si se incluirán solo los atributos requeridos o todos.
* @return {Object}
*/
function _createData (obj, onlyRequired) {
  if (!obj) {
    return null
  }
  if (Array.isArray(obj)) {
    const SOL = _createData(obj[0], onlyRequired)
    if (!SOL || Object.keys(SOL).length <= 0) return []
    return [SOL]
  }
  const data = {}
  for (let prop in obj) {
    const field = obj[prop]
    if (_isField(field)) {
      if (onlyRequired === true) {
        if (field.required) {
          data[prop] = _exampleData(field)
        }
      } else {
        data[prop] = _exampleData(field)
      }
    } else {
      if (typeof field === 'object') {
        data[prop] = _createData(obj[prop], onlyRequired)
      }
    }
  }
  return data
}

/**
* @ignore
* Función que indica si un objeto es un campo o no.
* @param {Object} obj - Objeto.
* @return {String}
*/
function _isField (obj) {
  if (obj && obj._modelAttribute && (obj._modelAttribute === true)) {
    return true
  }
  return false
}

/**
* @ignore
* Devuelve un dato de ejemplo.
* @param {Object} field - Atributo.
* @return {String|Boolean|Number|Object}
*/
function _exampleData (field) {
  if (field.example)      { return field.example }
  if (field.defaultValue) { return field.defaultValue }
  if (field.type.key === 'STRING')  { return 'text' }
  if (field.type.key === 'TEXT')    { return 'text block' }
  if (field.type.key === 'INTEGER') { return 1 }
  if (field.type.key === 'FLOAT')   { return 12.99 }
  if (field.type.key === 'BOOLEAN') { return false }
  if (field.type.key === 'ENUM')    { return field.type.values[0] }
  if (field.type.key === 'JSON')    { return { json: { data: 'value' } } }
  if (field.type.key === 'JSONB')   { return { jsonb: { data: 'value' } } }
  if (field.type.key === 'DATE')     { return '2018-02-03T00:39:45.113Z' }
  if (field.type.key === 'DATEONLY') { return '2018-02-03' }
  if (field.type.key === 'TIME')     { return '08:12:30' }
  if (field.type.key === 'UUID')     { return '15dab328-07dc-4400-a5ea-55f836c40f31' }
  if (field.type.key === 'ARRAY') {
    if (field.type.type.key === 'STRING')   { return ['Alfa', 'Beta'] }
    if (field.type.type.key === 'TEXT')     { return ['Text Block A', 'Text Block B'] }
    if (field.type.type.key === 'INTEGER')  { return [1, 2] }
    if (field.type.type.key === 'FLOAT')    { return [1.2, 2.8] }
    if (field.type.type.key === 'BOOLEAN')  { return [true, false] }
    if (field.type.type.key === 'DATE')     { return ['2018-02-03T00:39:45.113Z'] }
    if (field.type.type.key === 'DATEONLY') { return ['2018-02-03'] }
    if (field.type.type.key === 'TIME')     { return ['08:12:30'] }
    if (field.type.type.key === 'UUID')     { return ['15dab328-07dc-4400-a5ea-55f836c40f31'] }
    if (field.type.type.key === 'ENUM')     { return [field.type.type.values[0]] }
    if (field.type.type.key === 'JSON')     { return [{ json: { data: 'value' } }] }
    if (field.type.type.key === 'JSONB')    { return [{ jsonb: { data: 'value' } }] }
    return ['example']
  }
  return 'example'
}

module.exports = ApidocCreator
