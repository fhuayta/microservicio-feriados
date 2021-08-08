const program = require('commander')
const logger  = require('./logger')

const Command = program.Command

Command.prototype.missingArgument = function (name) {
  logger.appError()
  logger.appError('Error:', `Se requiere el argumento '${name}'.\n`)
  process.exit(1)
}

Command.prototype.helpInformation = function () {
  var desc = []
  if (this._description) {
    desc = [
      '  ' + this._description,
      ''
    ]

    var argsDescription = this._argsDescription
    if (argsDescription && this._args.length) {
      var width = this.padWidth()
      desc.push('  Argumentos:')
      desc.push('')
      this._args.forEach(function (arg) {
        desc.push('    ' + pad(arg.name, width) + '  ' + argsDescription[arg.name])
      })
      desc.push('')
    }
  }

  var cmdName = this._name
  if (this._alias) {
    cmdName = cmdName + '|' + this._alias
  }
  var usage = [
    '',
    `  ${logger.styles.BOLD}Modo de uso:${logger.styles.RESET} ` + cmdName + ' ' + this.usage(),
    ''
  ]

  var cmds = []
  var commandHelp = this.commandHelp()
  if (commandHelp) cmds = [commandHelp]

  var options = [
    `  ${logger.styles.BOLD}Opciones:${logger.styles.RESET}`,
    '',
    '' + this.optionHelp().replace(/^/gm, '    '),
    ''
  ]

  return usage
    .concat(desc)
    .concat(options)
    .concat(cmds)
    .concat([''])
    .join('\n')
}

Command.prototype.usage = function (str) {
  var args = this._args.map(function (arg) {
    return humanReadableArgName(arg)
  })

  var usage = '[opciones]' +
  (this.commands.length ? ' [commando]' : '') +
  (this._args.length ? ' ' + args.join(' ') : '')

  if (arguments.length === 0) return this._usage || usage
  this._usage = str

  return this
}

Command.prototype.commandHelp = function () {
  if (!this.commands.length) return ''

  var commands = this.prepareCommands()
  var width = this.padWidth()

  return [
    `  ${logger.styles.BOLD}Comandos:${logger.styles.RESET}`,
    '',
    commands.map(function (cmd) {
      var desc = cmd[1] ? '  ' + cmd[1] : ''
      return (desc ? pad(cmd[0], width) : cmd[0]) + desc
    }).join('\n').replace(/^/gm, '    '),
    ''
  ].join('\n')
}

Command.prototype.optionHelp = function () {
  var width = this.padWidth()

  // Append the help information
  return this.options.map(function (option) {
    return pad(option.flags, width) + '  ' + option.description +
      ((option.bool && option.defaultValue !== undefined) ? ' [Valor por defecto: ' + option.defaultValue + ']' : '')
  }).concat([pad('-h, --help', width) + '  ' + 'Información sobre el modo de uso.'])
    .join('\n')
}

Command.prototype.unknownOption = function (flag) {
  if (this._allowUnknownOption) return
  logger.appError()
  logger.appError('Error:', `No existe la opción '${flag}'.\n`)
  process.exit(1)
}

Command.prototype.optionMissingArgument = function (option, flag) {
  logger.appError()
  if (flag) {
    logger.appError('Error:', `opción '${option.flags}' falta el argumento, tiene '${flag}'.\n`)
  } else {
    logger.appError('Error:', `opción '${option.flags}' falta el argumento.\n`)
  }
  process.exit(1)
}

Command.prototype.version = function (str, flags) {
  if (arguments.length === 0) return this._version
  this._version = str
  flags = flags || '-V, --version'
  var versionOption = new program.Option(flags, 'Muestra el número de versión.')
  this._versionOptionName = versionOption.long.substr(2) || 'version'
  this.options.push(versionOption)
  this.on('option:' + this._versionOptionName, function () {
    process.stdout.write(str + '\n')
    process.exit(0)
  })
  return this
}

function pad (str, width) {
  var len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}

function humanReadableArgName (arg) {
  var nameOutput = arg.name + (arg.variadic === true ? '...' : '')

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']'
}

module.exports = program
