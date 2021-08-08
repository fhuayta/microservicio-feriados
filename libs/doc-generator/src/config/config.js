const path = require('path')
const _    = require('lodash')
const util = require('../tools/util')

const PROJECT_PATH = process.env.PROJECT_PATH || process.cwd()

const CONFIG_PATH         = path.resolve(PROJECT_PATH, 'doc.json')
const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../template/doc.json')

let config = _.clone(require(DEFAULT_CONFIG_PATH))

if (util.isFile(CONFIG_PATH)) {
  try {
    config = _.merge(config, require(CONFIG_PATH))
  } catch (e) {
    console.log('No se pudo cargar el fichero de configuración.', e)
  }
}

config.buildPath    = path.resolve(PROJECT_PATH, config.buildPath)
config.testPath     = path.resolve(PROJECT_PATH, config.testPath)
config.templatePath = path.resolve(PROJECT_PATH, config.templatePath)
config.compilePath  = path.resolve(PROJECT_PATH, config.compilePath)
config.helpersPath  = path.resolve(PROJECT_PATH, config.helpersPath)
// config.helpersType  = config.helpersType
//
// config.apiUrl         = config.apiUrl
// config.apiDescription = config.apiDescription
//
// config.serverPort     = config.serverPort
// config.serverPublic   = config.serverPublic
// config.serverRedirect = config.serverRedirect

config.appPath = path.resolve(PROJECT_PATH, config.appPath)

config.projectPath   = PROJECT_PATH
config.workspacePath = PROJECT_PATH

const cliPackage = require(path.resolve(__dirname, '../../package.json'))

config.cliName       = cliPackage.name
config.cliVersion    = cliPackage.version
config.cliVersionStr = `\n  ${config.cliName}: v${config.cliVersion}\n`

module.exports = config
