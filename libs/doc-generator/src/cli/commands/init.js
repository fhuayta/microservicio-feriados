const _      = require('lodash')
const path   = require('path')
const util   = require('../../tools/util')
const cli    = require('../../tools/cli')
const logger = require('../../tools/logger')
const config = require('../../config/config')

module.exports = async function action (options) {
  logger.appTitle('Configurando el proyecto ...')
  await parseArgs(options)

  const sourcePath = path.resolve(__dirname, '../../template/doc.json')
  const targetPath = path.resolve(process.cwd(), 'doc.json')

  if (options.force && util.isFile(targetPath)) { cli.removeFile(targetPath) }

  if (util.isFile(targetPath)) {
    throw new Error(`Ya existe un archivo de configuración.`)
  }

  // package.json
  const PACKAGE_PATH = path.resolve(config.projectPath, 'package.json')
  const packageContent = require(PACKAGE_PATH)

  const configContent = _.clone(require(sourcePath))
  configContent.apiName = `Apidoc - ${_toWords(packageContent.name)}`
  cli.writeFile(targetPath, `${JSON.stringify(configContent, null, 2)}\n`)

  packageContent.devDependencies = packageContent.devDependencies || {}
  packageContent.devDependencies['agetic-bpm-doc-generator'] = 'git+https://gitlab.geo.gob.bo/agetic/agetic-bpm-doc-generator.git'
  packageContent.devDependencies['ava'] = packageContent.devDependencies['ava'] || '^0.25.0'

  packageContent.scripts = packageContent.scripts || {}
  packageContent.scripts['doc:routes']   = 'NODE_ENV=test ./node_modules/.bin/doc routes'
  packageContent.scripts['doc:scaffold'] = 'NODE_ENV=test ./node_modules/.bin/doc scaffold'
  packageContent.scripts['doc:build']    = 'rm -rf doc/build && NODE_ENV=test ./node_modules/.bin/ava doc/test/* --serial --verbose && npm run doc:compile'
  packageContent.scripts['doc:compile']  = './node_modules/.bin/doc compile'
  packageContent.scripts['doc:server']   = './node_modules/.bin/doc server'
  packageContent.scripts['doc:start']    = 'npm run doc:compile && npm run doc:server'

  cli.updateFile(PACKAGE_PATH, `${JSON.stringify(packageContent, null, 2)}\n`)

  // gitignore
  const gitIgnoreBlock = util.readFile(path.resolve(__dirname, '../../template/gitignore.txt'))
  const GIT_IGNORE_PATH = path.resolve(config.projectPath, '.gitignore')
  let gitIgnoreContent = util.isFile(GIT_IGNORE_PATH) ? util.readFile(GIT_IGNORE_PATH) : ''
  if (!gitIgnoreContent.includes(gitIgnoreBlock)) {
    if (util.isFile(GIT_IGNORE_PATH)) {
      cli.updateFile(GIT_IGNORE_PATH, `${gitIgnoreContent}\n${gitIgnoreBlock}\n`)
    } else {
      cli.writeFile(GIT_IGNORE_PATH, `${gitIgnoreBlock}\n`)
    }
  }

  // Templates
  if (options.template) {
    cli.mkdir(config.templatePath)
    let sourcePath, targetPath

    sourcePath = path.resolve(__dirname, '../../template/test-body.js')
    targetPath = path.resolve(config.templatePath, 'test-body.js')
    cli.copyFile(sourcePath, targetPath)

    sourcePath = path.resolve(__dirname, '../../template/test-block.js')
    targetPath = path.resolve(config.templatePath, 'test-block.js')
    cli.copyFile(sourcePath, targetPath)
  }

  logger.appSuccess()
  logger.appSuccess(`info: `, `Tarea completada exitosamente. :)\n\n  Ejecuta 'npm install' para actualizar los paquetes.`)
  logger.appSuccess()
}

async function parseArgs (options) {
  options.force    = options.force    === true
  options.template = options.template === true
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
