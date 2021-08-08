#!/usr/bin/env node
const path    = require('path')

const config  = require('../config/config')
const program = require('../tools/commander-extends')
const logger  = require('../tools/logger')
const util    = require('../tools/util')

program.version(config.cliVersionStr)

function execute (command, ...args) {
  const IN_WORKSPACE = util.isFile(path.resolve(config.workspacePath, 'doc.json'))
  if (command !== 'init' && !IN_WORKSPACE) {
    logger.appError()
    logger.appError('Error:', `Debe dirigirse dentro de la carpeta del proyecto.\n`)
    process.exit(0)
  }
  return require(path.resolve(__dirname, `./commands/${command}`))(...args).catch(e => {
    logger.appError('Error:', `${e.message}\n`)
    console.log(e)
    process.exit(0)
  })
}

if (process.argv.length === 2) {
  process.stdout.write(`${config.cliVersionStr}\n`)
  process.exit(0)
}

program
  .command('init')
  .description('Crea un fichero de configuración para generar la documentación.')
  .option('-f, --force', 'Fuerza la creación del archivo de configuración (Elimina el archivo si existe).')
  .option('-t, --template', 'Indica si se crearán los templates para los tests.')
  .action((options) => execute('init', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`init`)
    logger.appExample(`init --force`)
    logger.appExample(`init --template`)
    logger.appExample()
  })

program
  .command('scaffold')
  .description('Crea los ficheros que serán utilizados para generar la documentación.')
  .action((options) => execute('scaffold', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`scaffold`)
    logger.appExample()
  })

program
  .command('build')
  .description('Construye los ficheros apidoc.js y swagger.json a partir de los ficheros creados con el comando scaffold.')
  .action((options) => execute('build', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`build`)
    logger.appExample()
  })

program
  .command('compile')
  .description('Compila los ficheros apidoc.js y swagger.json para que puedan ser visualizados en un navegador.')
  .action((options) => execute('compile', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`compile`)
    logger.appExample()
  })

program
  .command('server')
  .description('Ejecuta el servidor para mostrar la documentación.')
  .action((options) => execute('server', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`server`)
    logger.appExample()
  })

program
  .command('routes')
  .description('Muestra todas las rutas.')
  .action((options) => execute('routes', options))
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`routes`)
    logger.appExample()
  })

program
  .on('--help', () => {
    logger.appExampleTitle('Ejemplos:')
    logger.appExample(`init`)
    logger.appExample(`scaffold`)
    logger.appExample(`build`)
    logger.appExample(`compile`)
    logger.appExample(`server`)
    logger.appExample()
    logger.appExampleTitle('Modo de uso de un comando específico:')
    logger.appExample(`scaffold --help`)
    logger.appExample(`server --help`)
    logger.appExample()
  })

program
  .on('command:*', function () {
    const MSG = `\n Ejecuta la opción --help para obtener una lista de los comandos disponibles.\n`
    logger.appError()
    logger.appError('Error:', `Comando inválido: '${program.args.join(' ')}'\n`, MSG)
  })

program.parse(process.argv)
