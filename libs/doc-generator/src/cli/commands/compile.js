const path = require('path')

const config = require('../../config/config')
const logger = require('../../tools/logger')
const util   = require('../../tools/util')

module.exports = async function action (options) {
  logger.appTitle('Compilando ...')

  await _mergeDocFiles()

  await _compileApidocJS()
  await _copySwaggerJSONFile()

  logger.appSuccess()
  logger.appSuccess(`info: `, `Tarea completada exitosamente :)`)
  logger.appSuccess()
}

async function _mergeDocFiles () {
  console.log('\n Actualizando ficheros ...\n')

  // APIDOC JS
  const filePath1 = path.resolve(config.buildPath, `apidoc.js`)
  if (util.isFile(filePath1)) {
    util.removeFile(filePath1)
  }

  let content = ''
  util.find(path.resolve(config.buildPath, 'routes'), '.js',  (info) => {
    const newBlock = util.readFile(info.filePath)
    const newRouteKey = newBlock.split('\n')[2]
    if (content.includes(newRouteKey)) {
      // console.log(` \x1b[33mAdvertencia:\x1b[0m El servicio "${newRouteKey.substr(7)}" ya ha sido documentado. (ignorado)`)
      return
    }
    content += newBlock
  })
  util.writeFile(filePath1, content)
  console.log('', filePath1.replace(process.cwd(), ''), '\u2713')

  // SWAGGER
  const filePath2 = path.resolve(config.buildPath, `swagger.json`)
  if (util.isFile(filePath2)) {
    util.removeFile(filePath2)
  }

  let content2 = null
  util.find(path.resolve(config.buildPath, 'routes'), '.json',  (info) => {
    const contentToAdd = require(info.filePath)
    if (!content2) {
      content2 = contentToAdd
      return
    }
    if (!util.toArray(content2.tags, 'name').includes(contentToAdd.tags[0].name)) {
      content2.tags.push(contentToAdd.tags[0])
    }
    Object.keys(contentToAdd.paths).forEach(routePath => {
      content2.paths[routePath] = content2.paths[routePath] || {}
      Object.keys(contentToAdd.paths[routePath]).forEach(routeMethod => {
        if (content2.paths[routePath][routeMethod]) {
          return
        }
        content2.paths[routePath][routeMethod] = contentToAdd.paths[routePath][[routeMethod]]
      })
    })
  })
  util.writeFile(filePath2, JSON.stringify(content2, null, 2))
  console.log('', filePath2.replace(process.cwd(), ''), '\u2713\n')
}

async function _compileApidocJS () {
  console.log('\n Publicando ficheros ...\n')
  const templatePath        = path.resolve(__dirname, '../../template/apidocjs')
  const templatePathSwagger = path.resolve(__dirname, '../../template/swagger')
  const tmpPath             = path.resolve(__dirname, '../../.temp')
  util.mkdir(tmpPath)
  const apidocConfig = {
    title       : 'Apidoc',
    name        : config.apiName,
    description : '',
    version     : config.apiVersion,
    url         : `${config.apiUrl}`,
    sampleUrl   : `${config.apiUrl}`,
    template    : {
      withGenerator : false,
      withCompare   : true,
      forceLanguage : 'es'
    },
    header : null,
    footer : null
  }
  util.writeFile(path.resolve(tmpPath, 'apidoc.json'), JSON.stringify(apidocConfig, null, 2))
  util.copyFile(path.resolve(config.buildPath, `apidoc.js`), path.resolve(tmpPath, `apidoc.js`))
  const output = path.resolve(config.compilePath, 'apidoc')
  console.log('', output.replace(process.cwd(), ''), '\u2713')
  const SWAGGER_OUTPUT_PATH = path.resolve(config.compilePath, 'swagger')
  await util.copyDir(templatePathSwagger, SWAGGER_OUTPUT_PATH)
  console.log('', SWAGGER_OUTPUT_PATH.replace(process.cwd(), ''), '\u2713')
  try { util.rmdir(output) } catch (e) { }
  try {
    await _createApidoc('.', output, templatePath, tmpPath)
  } catch (e) { throw e }
  try { util.rmdir(tmpPath) } catch (e) {}
}

/**
* Ejecuta el comando para crear el APIDOC.
* @param {String} input    - Ruta del directorio de entrada.
* @param {String} output   - Ruta del directorio de salida.
* @param {String} template - Ruta del directorio del template.
* @param {String} execPath - Ruta desde donde se ejecutará el comando.
* @return {Promise}
*/
async function _createApidoc (input, output, template, execPath) {
  let apidocProgramPath = `../../apidoc/bin/apidoc`
  if (util.isFile(path.resolve(execPath, apidocProgramPath))) {
    return util.cmd(`node "${apidocProgramPath}" -i "${input}" -o "${output}" -t "${template}"`, execPath)
  }
  apidocProgramPath = `../node_modules/apidoc/bin/apidoc`
  if (util.isFile(path.resolve(execPath, apidocProgramPath))) {
    return util.cmd(`node "${apidocProgramPath}" -i "${input}" -o "${output}" -t "${template}"`, execPath)
  }
  try {
    return util.cmd(`apidoc -i "${input}" -o "${output}" -t "${template}"`, execPath)
  } catch (e) {
    if (typeof e === 'string' && (e.includes('apidoc: not found') || e.includes('no se reconoce como un comando'))) {
      throw new Error(`ApidocJS no se encuentra instalado: Ejecute 'npm install -g apidoc' para solucionarlo.`)
    }
    throw e
  }
}

async function _copySwaggerJSONFile () {
  const SWAGGER_JSON_OUTPUT_PATH = path.resolve(config.compilePath, `swagger/swagger.json`)
  util.copyFile(path.resolve(config.buildPath, `swagger.json`), SWAGGER_JSON_OUTPUT_PATH)
  console.log('', SWAGGER_JSON_OUTPUT_PATH.replace(process.cwd(), ''), '\u2713')
}
