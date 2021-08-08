/** @ignore */ const _          = require('lodash')
/** @ignore */ const Sequelize  = require('sequelize')
/** @ignore */ const moment     = require('moment')

/**
* Clase para definir campos.
*/
class FieldCreator {
  /**
  * Devuelve un campo de tipo STRING que representa un a cadena de texto.
  * @param {Number|Object} [LENGTH]              - Longitud de la cadena o propiedades del campo.
  * @param {Object}        [PROPERTIES]          - Propiedades del campo.
  * @param {String}        [PROPERTIES.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static STRING (LENGTH, PROPERTIES = {}) {
    const length     = (LENGTH && (typeof LENGTH === 'number')) ? LENGTH : 255
    const properties = (LENGTH && (typeof LENGTH === 'object')) ? LENGTH : PROPERTIES
    properties.type            = Sequelize.STRING(length)
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo INTEGER que representa un número entero.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static INTEGER (properties = {}) {
    properties.type            = Sequelize.INTEGER()
    properties.validate        = _createValidate(properties.type, { min: 0 }, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo FLOAT que representa un número en coma flotante.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static FLOAT (properties = {}) {
    properties.type            = Sequelize.FLOAT()
    properties.validate        = _createValidate(properties.type, { min: 0 }, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo BOOLEAN que representa un valor booleano.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static BOOLEAN (properties = {}) {
    properties.type            = Sequelize.BOOLEAN()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo DATE que representa una fecha.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static DATE (properties = {}) {
    properties.type            = Sequelize.DATE()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo DATEONLY que representa a una fecha sin tiempo.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static DATEONLY (properties = {}) {
    properties.type            = Sequelize.DATEONLY()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo TIME que representa a una hora 00:00:00 - 24:00:00.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static TIME (properties = {}) {
    properties.type            = Sequelize.TIME()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo TEXT que representa un bloque de texto.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static TEXT (properties = {}) {
    properties.type            = Sequelize.TEXT()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo JSON que representa a un objeto de tipo JSON.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static JSON (properties = {}) {
    properties.type            = Sequelize.JSON()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo JSONB que representa a un objeto de tipo JSONB.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static JSONB (properties = {}) {
    properties.type            = Sequelize.JSONB()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo UUID que representa a una cadena de texto de tipo UUID.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static UUID (properties = {}) {
    properties.type            = Sequelize.UUID()
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo ARRAY que representa una lista.
  * Tipo de dato soportado: STRING, INTEGER, FLOAT, BOOLEAN o DATE
  * @param {Object} field                 - Tipo de dato de los elementos de la lista.
  * @param {Object} [properties]          - Propiedades del campo.
  * @param {String} [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static ARRAY (field, properties = {}) {
    const args = field.type.key === 'STRING' ? field.type.options.length : (field.type.key === 'ENUM' ? field.type.values : undefined)
    properties.type            = Sequelize.ARRAY(Sequelize[field.type.key](args))
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Devuelve un campo de tipo ENUM que representa un conjunto de valores.
  * @param {!String[]} values               - Valores del campo.
  * @param {Object}   [properties]          - Propiedades del campo.
  * @param {String}   [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static ENUM (values, properties = {}) {
    properties.type            = Sequelize.ENUM(values)
    properties.validate        = _createValidate(properties.type, null, properties.validate)
    properties._modelAttribute = true
    return properties
  }

  /**
  * Convierte las propiedades de un atributo en una referencia THIS.
  * Opcionalmente se puede indicar el nombre del modelo.
  * @param {Object} [properties] - Propiedades del campo.
  * @return {Object}
  */
  static THIS (properties = {}) {
    properties._this = true
    return properties
  }

  /**
  * Devuelve un campo a partir de un atributo que ya ha sido definido.
  * @param {!Object} field                 - Atributo sequelize.
  * @param {Object}  [properties]          - Propiedades a modificar del campo.
  * @param {String}  [properties.validate] - Objeto para validar el campo.
  * @return {Object}
  */
  static clone (field, properties = {}) {
    if (!field.type) {
      throw new Error(`El objeto a clonar debe ser atributo de un modelo sequelize.`)
    }
    properties = Object.assign(_.cloneDeep(field), properties)
    delete properties.fieldName
    properties._modelAttribute = true
    return properties
  }

  /**
  * Adiciona un tipo de dato personalizado a la lista de tipos existente.
  * @param {!String} name                    - Nombre con el que se identificará al nuevo tipo de campo.
  * @param {!Field}  field                   - Instancia de la clase Field.
  * @param {Object}  options                 - Opciones de adición.
  * @param {Boolean} [options.force = false] - Indica si se sobreescribirá el tipo de dato anterior, si es que hubiese.
  */
  static use (name, field, options = {}) {
    options.force = typeof options.force === 'boolean' ? options.force : false
    const NAME = name.toUpperCase()
    FieldCreator[NAME] = (properties = {}) => { return FieldCreator.clone(field, properties) }
  }

  /**
  * Crea un objeto con campos definidos en varios niveles a partir de un modelo.
  * Los niveles son las asociaciones que tiene el modelo.
  * @param {SequelizeModel} [model] - Modelo Sequelize.
  * @param {Object}         obj     - Objeto que contiene campos con referencias THIS.
  * @return {Object}
  */
  static group (model, obj) {
    return _updateTHIS(model, obj)
  }

  /**
  * Valida el contenido de un objeto FieldGrouṕ.
  * @param {Object} fieldGroup - Objeto a validar.
  */
  static validateGroup (fieldGroup) {
    _validateGroup(fieldGroup)
  }

  static groupObj (obj) {
    return _toFieldGroup(obj)
  }
}

/**
* @ignore
* Indica si un objeto es una referencia THIS.
* @param {Object} obj - Objeto.
* @return {Boolean}
*/
function _isTHIS (obj) {
  if (obj && obj._this && (obj._this === true)) {
    return true
  }
  return false
}

/**
* @ignore
* Indica si un objeto es atributo de un modelo.
* @param {Object} obj - Objeto.
* @return {Boolean}
*/
function _isField (obj) {
  if (obj && obj._modelAttribute && (obj._modelAttribute === true)) {
    return true
  }
  return false
}

/**
* @ignore
* Devuelve un objeto cuyos campos han sido definidos como THIS, con el valor que le corresponde.
* Si el atributo no tiene un fieldName, se le asigna uno.
* @param {SequelizeModel} model       - Modelo Sequelize
* @param {Object}         obj         - Objeto (grupo de fields).
* @param {String}         fullPath    - Nombre completo de la propiedad.
* @param {Model}          [baseModel] - Modelo declarado en la función group (Field.group(model, { ... })).
* @return {Object}
*/
function _updateTHIS (model, obj, fullPath = '', baseModel) {
  const RESULT = {}
  if (Array.isArray(obj)) {
    return [_updateTHIS(model, obj[0], fullPath, baseModel || model)]
  }
  Object.keys(obj).forEach(prop => {
    const OBJ = obj[prop]
    const fullPath2 = `${fullPath ? `${fullPath}.` : ''}${prop}`
    if (_isTHIS(OBJ)) {
      if (!model || !model.attributes[prop]) {
        let msg = `El campo '${fullPath2}: THIS()' no es parte del modelo ${baseModel ? `'${baseModel.name}'` : `'${model ? model.name : 'null'}'`}.\n`
        throw new Error(msg)
      }
      delete OBJ._this
      RESULT[prop] = Object.assign(_.cloneDeep(model.attributes[prop]), OBJ)
      return
    }
    if (_isField(OBJ)) {
      OBJ.fieldName = OBJ.fieldName || prop
      OBJ.field     = OBJ.field     || prop
      RESULT[prop] = OBJ
      return
    }
    if (typeof OBJ === 'object') {
      const SUB_MODEL = (model && model.associations[prop]) ? model.associations[prop].target : null
      RESULT[prop] = _updateTHIS(SUB_MODEL, OBJ, `${fullPath2}`, baseModel || model)
    }
  })
  return RESULT
}

/**
* @ignore
* Valida el objeto FieldGroup.
* @param {Object} obj      - Objeto de tipo FieldGRoup.
* @param {String} fullPath - Nombre completo de una propiedad
*/
function _validateGroup (obj, fullPath = '') {
  if (Array.isArray(obj)) {
    if (obj.length !== 1 || typeof obj[0] !== 'object' || Array.isArray(obj[0])) {
      throw new Error(`El campo '${fullPath}' debe ser un Array de 1 solo elemento de tipo 'object'`)
    }
    return _validateGroup(obj[0], fullPath)
  }
  Object.keys(obj).forEach(prop => {
    const OBJ = obj[prop]
    if (_isField(OBJ)) {
      return
    }
    const fullPath2 = `${fullPath ? `${fullPath}.` : ''}${prop}`
    if (_isTHIS(OBJ)) {
      let msg = `El campo '${fullPath2}: THIS()' debe ser parte de un modelo.\n`
      throw new Error(msg)
    }
    if (typeof OBJ === 'object') {
      return _validateGroup(OBJ, `${fullPath2}`)
    }
    throw new Error(`El campo '${fullPath2}' = '${OBJ}' es inválido.`)
  })
}

/**
* @ignore
* Devuelve un objeto validate.
* @param {!SequelizeType} type              - Propiedad tipo del atributo de un modelo sequelize.
* @param {Object}         [defaultValidate] - Propiedad validate por defecto.
* @param {Object}         [customValidate]  - Propiedad validate personalizado.
* @return {Object}
*/
function _createValidate (type, defaultValidate = {}, customValidate) {
  if (customValidate === null) { return null }
  let val = {}
  if (type.key === 'STRING')   { val = { len: [0, type.options.length] } }
  if (type.key === 'TEXT')     { val = { len: [0, 2147483647] } }
  if (type.key === 'INTEGER')  { val = { isInt: true, min: -2147483647, max: 2147483647 } }
  if (type.key === 'FLOAT')    { val = { isFloat: true, min: -1E+308, max: 1E+308 } }
  if (type.key === 'ENUM')     { val = { isIn: [type.values] } }
  if (type.key === 'BOOLEAN')  { val = { isBoolean: true } }
  if (type.key === 'DATE')     { val = { isDate: true } }
  if (type.key === 'DATEONLY') { val = { isDate: true } }
  if (type.key === 'TIME')     { val = { isTime: _isTimeValidate() } }
  if (type.key === 'JSON')     { val = { isJson: _isJsonValidate() } }
  if (type.key === 'JSONB')    { val = { isJson: _isJsonValidate() } }
  if (type.key === 'UUID')     { val = { isUUID: 4 } }
  if (type.key === 'ARRAY')    { val = { isArray: _isArrayValidate(type.type) } }
  const FIELD = { validate: Object.assign(Object.assign(val, defaultValidate), customValidate) }
  _normalizeValidate(FIELD)
  return FIELD.validate
}

/**
* @ignore
* Devuelve un validador para el tipo de dato TIME.
* @return {Function}
*/
function _isTimeValidate () {
  return (value) => {
    if (!moment(value, 'HH:mm:ss', true).isValid()) {
      throw new Error(`Formato válido: HH:mm:ss`)
    }
  }
}

/**
* @ignore
* Devuelve un validador para el tipo de dato JSON.
* @return {Function}
*/
function _isJsonValidate () {
  return (value) => {
    if (typeof value !== 'object') {
      throw new Error('Debe ser un objeto de tipo JSON.')
    }
  }
}

/**
* @ignore
* Devuelve un validador para el tipo de dato ARRAY.
* @param {SequelizeType} type - Propiedad tipo del atributo de un modelo sequelize.
* @return {Function}
*/
function _isArrayValidate (type) {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new Error(`Debe ser un Array.`)
    }
    value.forEach(val => {
      if ((type.key === 'STRING') && !Sequelize.Validator.len(`${val}`, 0, type.options.length)) {
        throw new Error(`Cada elemento debe ser una cadena de texto con un máximo de ${type.options.length} caracteres.`)
      }
      if ((type.key === 'TEXT') && !Sequelize.Validator.len(`${val}`, 0, 2147483647)) {
        throw new Error(`Cada elemento debe ser una cadena de texto.`)
      }
      if ((type.key === 'INTEGER') && !Sequelize.Validator.isInt(`${val}`)) {
        throw new Error(`Cada elemento debe ser de un número de tipo INTEGER.`)
      }
      if ((type.key === 'FLOAT') && !Sequelize.Validator.isFloat(`${val}`)) {
        throw new Error(`Cada elemento debe ser de un número de tipo FLOAT.`)
      }
      if ((type.key === 'BOOLEAN') && !Sequelize.Validator.isBoolean(`${val}`)) {
        throw new Error(`Cada elemento debe ser de tipo boolean.`)
      }
      if ((type.key === 'DATE') && !Sequelize.Validator.isDate(`${val}`)) {
        throw new Error(`Cada elemento debe ser una fecha válida.`)
      }
      if ((type.key === 'DATEONLY') && !Sequelize.Validator.isDate(`${val}`)) {
        throw new Error(`Cada elemento debe ser una fecha válida.`)
      }
      if ((type.key === 'TIME') && !moment(val, 'HH:mm:ss', true).isValid()) {
        throw new Error(`Cada elemento debe ser una hora válida.`)
      }
      if ((type.key === 'JSON') && (typeof val !== 'object')) {
        throw new Error(`Cada elemento debe ser un objeto de tipo JSON.`)
      }
      if ((type.key === 'JSONB') && (typeof val !== 'object')) {
        throw new Error(`Cada elemento debe ser un objeto de tipo JSON.`)
      }
      if ((type.key === 'UUID') && !Sequelize.Validator.isUUID(`${val}`)) {
        throw new Error(`Cada elemento debe ser una cadena de texto de tipo UUID.`)
      }
      if ((type.key === 'ENUM') && !Sequelize.Validator.isIn(`${val}`, type.values)) {
        throw new Error(`Cada elemento debe ser uno de los siguientes valores: ${type.values.toString()}.`)
      }
    })
  }
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

function _toFieldGroup (obj, fullPath = '') {
  const RESULT = {}
  if (Array.isArray(obj)) {
    if (obj.length <= 0) { return [] }
    const item = _getMaxItem(obj)
    return (typeof item === 'object') ? [_toFieldGroup(item, fullPath)] : FieldCreator.ARRAY(getField(item), { example: [item], allowNull: false })
  }
  if (obj) {
    Object.keys(obj).forEach(prop => {
      const OBJ = obj[prop]
      const fullPath2 = `${fullPath ? `${fullPath}.` : ''}${prop}`
      if (typeof OBJ === 'object') {
        RESULT[prop] = _toFieldGroup(OBJ, `${fullPath2}`)
        return
      }
      RESULT[prop] = getField(OBJ)
    })
    return RESULT
  }
  return null
}

function _getMaxItem (array) {
  let maxId = -1
  let propLength = 0
  for (let i = 0; i <= array.length; i++) {
    const item = array[i]
    const length = item ? Object.keys(item).length : 0
    if (length > propLength) {
      maxId = i
      propLength = length
    }
  }
  return array[maxId]
}

function getField (OBJ) {
  switch (typeof OBJ) {
    case 'string'  : return FieldCreator.STRING({ example: OBJ, allowNull: false })
    case 'boolean' : return FieldCreator.BOOLEAN({ example: OBJ, allowNull: false })
    case 'number'  : return FieldCreator.INTEGER({ example: OBJ, allowNull: false })
  }
  return OBJ
}

module.exports = FieldCreator
