/**
* Clase para crear logs.
*/
class Logger {
  /**
  * Crea una instancia de Logger.
  */
  constructor () {
    /**
    * Colores para los logs
    * ansicolor: https://github.com/shiena/ansicolor/blob/master/README.md
    * @type {Object}
    */
    this.colors = {
      BLACK         : `\x1b[30m`,
      RED           : `\x1b[31m`,
      GREEN         : `\x1b[32m`,
      YELLOW        : `\x1b[33m`,
      BLUE          : `\x1b[34m`,
      MAGENTA       : `\x1b[35m`,
      CYAN          : `\x1b[36m`,
      LIGHT_GREY    : `\x1b[90m`,
      LIGHT_RED     : `\x1b[91m`,
      LIGHT_GREEN   : `\x1b[92m`,
      LIGHT_YELLOW  : `\x1b[93m`,
      LIGHT_BLUE    : `\x1b[94m`,
      LIGHT_MAGENTA : `\x1b[95m`,
      LIGHT_CYAN    : `\x1b[96m`,
      LIGHT_WHITE   : `\x1b[97m`
    }
    const colors = this.colors
    if (process.env.COLORS === 'false') {
      Object.keys(colors).forEach(key => { colors[key] = '' })
    }
    colors.RESET   = `\x1b[0m`
    colors.WHITE = colors.LIGHT_WHITE

    /**
    * Estilos para los logs.
    * @type {Object}
    */
    this.styles = {
      BOLD          : `\x1b[1m`,
      BOLD_OFF      : `\x1b[21m`,
      UNDERLINE     : `\x1b[4m`,
      UNDERLINE_OFF : `\x1b[24m`,
      BLINK         : `\x1b[5m`,
      BLINK_OFF     : `\x1b[25m`
    }
    const styles = this.styles
    styles.RESET   = `\x1b[0m`

    colors.PRIMARY = `${styles.BOLD}${colors.LIGHT_BLUE}`
    colors.ACCENT  = `${styles.BOLD}`
    colors.TEXT    = `${colors.RESET}`

    colors.FATAL   = `${styles.BOLD}${colors.RED}`
    colors.ERROR   = `${styles.BOLD}${colors.LIGHT_RED}`
    colors.WARN    = `${styles.BOLD}${colors.LIGHT_YELLOW}`
    colors.NOTICE  = `${styles.BOLD}${colors.LIGHT_GREEN}`
    colors.INFO    = `${styles.BOLD}${colors.LIGHT_WHITE}`
    colors.VERBOSE = `${styles.BOLD}${colors.LIGHT_CYAN}`
    colors.DEBUG   = `${styles.BOLD}${colors.LIGHT_BLUE}`
    colors.SILLY   = `${styles.BOLD}${colors.LIGHT_MAGENTA}`

    /**
    * Contiene los niveles de logs.
    * @type {Object}
    */
    this.levels = { fatal: 0, error: 1, warn: 2, notice: 3, info: 4, verbose: 5, debug: 6, silly: 7 }

    /**
    * Contiene los colores asociados a los diferentes niveles de logs.
    * @type {Object}
    */
    this.levelColors = {
      fatal   : colors.RED,           // 0 Mensajes críticos
      error   : colors.LIGHT_RED,     // 1 Mensajes de error
      warn    : colors.LIGHT_YELLOW,  // 2 Mensajes de advertencia
      notice  : colors.LIGHT_GREEN,   // 3 Mensajes importantes
      info    : colors.RESET,         // 4 Mensajes informativos
      verbose : colors.LIGHT_CYAN,    // 5 Mensajes detallados
      debug   : colors.BLUE,          // 6 Mensajes para el depurador
      silly   : colors.MAGENTA        // 7 Mensajes sin importancia
    }

    /**
    * Cadena de texto que representa un Ok.
    * @type {String}
    */
    this.OK = `${colors.TEXT}${process.platform === 'linux' ? '\u2713' : ''}${colors.RESET}`

    /**
    * Cadena de texto que representa un Fail.
    * @type {String}
    */
    this.FAIL = `${colors.TEXT}${process.platform === 'linux' ? '\u2715' : 'x'}${colors.RESET}`
  }

  /**
  * Indica si los logs están habilitados.
  * @return {Boolean}
  */
  isEnabled () {
    return !process.env.LOGGER || process.env.LOGGER === 'true'
  }

  /**
  * Muestra el título principal de una tarea.
  * @param {String} title - Título principal.
  */
  appTitle (title) {
    const colors = this.colors
    let msg = ''
    msg += `\n`
    msg += ` ${colors.ACCENT}${title}${colors.RESET}\n`
    // msg += ` ${colors.PRIMARY}${_.pad('', title.length, '=')}${colors.RESET}\n`
    msg += `\n`
    process.stdout.write(msg)
  }

  /**
  * Muestra el título secundario de una tarea.
  * @param {String} title - Título secundario.
  */
  appTitle2 (title) {
    const colors = this.colors
    process.stdout.write(`\n`)
    process.stdout.write(` ${colors.ACCENT}${title}${colors.RESET}\n`)
    process.stdout.write(`\n`)
  }

  appPrimary (title = '', message = '', data = '') {
    const colors = this.colors
    const C1 = colors.PRIMARY
    const C2 = colors.TEXT
    const C3 = colors.TEXT
    const RT = colors.RESET
    process.stdout.write(` ${C1}${title}${RT} ${C2}${message}${RT} ${C3}${data}${RT}\n`)
  }

  appAccent (title = '', message = '', data = '') {
    const colors = this.colors
    const styles = this.styles
    const C1 = colors.ACCENT
    const C2 = colors.TEXT
    const C3 = colors.TEXT
    const RT = `${colors.RESET}${styles.RESET}`
    process.stdout.write(` ${C1}${title}${RT} ${C2}${message}${RT} ${C3}${data}${RT}\n`)
  }

  appError (title = '', message = '', data = '') {
    const colors = this.colors
    const C1 = colors.ERROR
    const C2 = colors.TEXT
    const C3 = colors.TEXT
    const RT = colors.RESET
    process.stdout.write(` ${C1}${title}${RT} ${C2}${message}${RT} ${C3}${data}${RT}\n`)
  }

  appExample (command) {
    const colors = this.colors
    const message = command ? `   $ doc ${command}` : ''
    process.stdout.write(`  ${colors.TEXT}${message}${colors.RESET}\n`)
  }

  appExampleTitle (title) {
    const styles = this.styles
    process.stdout.write(`  ${styles.BOLD}${title}${styles.RESET}\n\n`)
  }

  appSuccess (before = '', word = '', after = '') {
    const colors = this.colors
    const C1 = colors.GREEN
    const C2 = colors.TEXT
    const RT = colors.RESET
    process.stdout.write(`  ${C1}${before}${RT} ${C2}${word}${RT} ${C1}${after}${RT}\n`)
  }

  appInfo (...args) {
    this.appSuccess(...args)
  }
}

module.exports = new Logger()
