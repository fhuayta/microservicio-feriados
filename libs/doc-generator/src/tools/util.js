/** @ignore */ const fs       = require('fs')
/** @ignore */ const path     = require('path')
/** @ignore */ const mkdirp   = require('mkdirp')
/** @ignore */ const { exec } = require('child_process')

// |=============================================================|
// |-------------- VARIOS ---------------------------------------|
// |=============================================================|

/**
* Devuelve una lista que contiene información de los archivos encontrados.
* Adicionalmente puede ejecutar una función (onFind) cuando encuentra un archivo.
* @param {String}   dirPath                - Directorio de búsqueda.
* @param {String}   ext                    - Extensión del archivo.
* @param {Function} [onFind]               - Función que se ejecuta cuando encuentra el archivo.
* @param {Object}   [options]              - Opciones adicionales de búsqueda
* @param {String[]} [options.ignoredPaths] - Lista de las rutas que serán ignoradas
* @return {Object[]}
*/
exports.find = (dirPath, ext, onFind, options = {}) => {
  options.ignoredPaths = options.ignoredPaths || []
  const result = []
  function _isIgnored (filePath) {
    for (let i in options.ignoredPaths) {
      if (filePath.startsWith(options.ignoredPaths[i])) { return true }
    }
  }
  function _find (filePath) {
    if (_isIgnored(filePath)) { return }
    if (fs.statSync(filePath).isDirectory()) {
      fs.readdirSync(filePath).forEach((fileName) => {
        _find(path.resolve(filePath, fileName))
      })
    } else {
      if (filePath.endsWith(ext)) {
        const dirPath  = path.dirname(filePath)
        const fileName = filePath.split(path.sep).pop().replace(ext, '')
        const dirName  = dirPath.split(path.sep).pop()
        const fileExt  = ext
        const fileInfo = { filePath, dirPath, fileName, dirName, fileExt }
        if (onFind) { onFind(fileInfo) }
        result.push(fileInfo)
      }
    }
  }
  _find(dirPath)
  return result
}

/**
* Devuelve una lista que contiene información de los archivos encontrados.
* Adicionalmente puede ejecutar una función (async onFind) cuando encuentra un archivo.
* @param {String}        dirPath           - Directorio de búsqueda.
* @param {String}        ext               - Extensión del archivo.
* @param {AsyncFunction} onFind            - Función asíncrona que se ejecuta cuando
*                                            encuentra el archivo.
* @param {Object}   [options]              - Opciones adicionales de búsqueda
* @param {String[]} [options.ignoredPaths] - Lista de las rutas que serán ignoradas
* @return {Promise}
*/
exports.findAsync = async (dirPath, ext, onFind, options = {}) => {
  options.ignoredPaths = options.ignoredPaths || []
  const result = []
  function _isIgnored (filePath) {
    for (let i in options.ignoredPaths) {
      if (filePath.startsWith(options.ignoredPaths[i])) { return true }
    }
  }
  async function _find (filePath) {
    if (_isIgnored(filePath)) { return }
    if (fs.statSync(filePath).isDirectory()) {
      const directories = fs.readdirSync(filePath)
      for (let i in directories) {
        await _find(path.resolve(filePath, directories[i]))
      }
    } else {
      if (filePath.endsWith(ext)) {
        const dirPath  = path.dirname(filePath)
        const fileName = filePath.split(path.sep).pop().replace(ext, '')
        const dirName  = dirPath.split(path.sep).pop()
        const fileExt  = ext
        const fileInfo = { filePath, dirPath, fileName, dirName, fileExt }
        if (onFind) { await onFind(fileInfo) }
        result.push(fileInfo)
      }
    }
  }
  await _find(dirPath)
  return result
}

/**
* Devuelve una promesa que simula una tarea.
* @param {Number} timeout - Tiempo de espera.
* @return {Promise}
*/
exports.timer = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, timeout)
  })
}

/**
* Ejecuta un comando desde la terminal.
* @param {String}   command     - Comando a ejecutar.
* @param {String}   executePath - Ruta desde donde se ejecutará el comando.
* @return {Promise}
*/
exports.cmd = function cmd (command, executePath) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: executePath }, (error, stdout, stderr) => {
      if (error) { return reject(error) }
      if (stdout) { process.stdout.write(stdout) }
      if (stderr) { process.stderr.write(stderr) }
      return resolve(stdout)
    })
  })
}

/**
* Devuelve un array de datos a partir de un array de objetos,
* indicando una propiedad del objeto.
* @param {Object[]} data     - Lista de objetos.
* @param {String}   property - Propiedad a extraer.
* @return {String|Number|Boolean[]}
*/
exports.toArray = (data, property) => {
  const result = []
  const props = property.split('.')
  data.forEach(obj => {
    for (let i in props) { obj = obj[props[i]] }
    result.push(obj)
  })
  return result
}

// |=============================================================|
// |-------------- DIRECTORIOS ----------------------------------|
// |=============================================================|

/**
* Indica si existe un directorio.
* @param {String} dirPath - Ruta del directorio
* @return {Boolean}
*/
exports.isDir = (dirPath) => {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

/**
* Crea un directorio recursivamente.
* @param {String} dirPath - Ruta del directorio
*/
exports.mkdir = (dirPath) => {
  mkdirp.sync(dirPath)
}

/**
* Elimina un directorio recursivamente.
* @param {String} dirPath - Ruta del directorio
*/
exports.rmdir = (dirPath) => {
  function _rmdir (dirPath) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      fs.readdirSync(dirPath).forEach(fileName => {
        const filePath = path.resolve(dirPath, fileName)
        if (fs.statSync(dirPath).isDirectory()) {
          _rmdir(filePath)
        } else { fs.unlinkSync(filePath) }
      })
      fs.rmdirSync(dirPath)
    } else { fs.unlinkSync(dirPath) }
  }
  _rmdir(dirPath)
}

/**
* Copia un directorio.
* @param {String} sourcePath - Ruta de origen.
* @param {String} targetPath - Ruta de destino.
*/
exports.copyDir = (source, target) => {
  function _copy (sourcePath, targetPath) {
    if (fs.statSync(sourcePath).isDirectory()) {
      mkdirp.sync(targetPath)
      fs.readdirSync(sourcePath).forEach(fileName => {
        _copy(path.resolve(sourcePath, fileName), path.resolve(targetPath, fileName))
      })
    } else {
      fs.createReadStream(sourcePath).pipe(fs.createWriteStream(targetPath))
    }
  }
  _copy(source, target)
}

// |=============================================================|
// |-------------- ARCHIVOS -------------------------------------|
// |=============================================================|

/**
* Indica si existe un archivo.
* @param {String} filePath - Ruta del archivo.
* @return {Boolean}
*/
exports.isFile = (filePath) => {
  return fs.existsSync(filePath) && !(fs.statSync(filePath).isDirectory())
}

/**
* Devuelve el contenido de un archivo de texto.
* @param {String} filePath - Ruta del archivo.
* @return {String}
*/
exports.readFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8')
}

/**
* Crea un archivo.
* @param {String} filePath - Ruta del archivo.
* @param {String} content  - Contenido del archivo.
*/
exports.writeFile = (filePath, content) => {
  mkdirp.sync(path.dirname(filePath))
  fs.writeFileSync(filePath, content)
}

/**
* Elimina un archivo.
* @param {String} filePath - Ruta del archivo.
*/
exports.removeFile = (filePath) => {
  fs.unlinkSync(filePath)
}

/**
* Copia un archivo.
* @param {String} sourcePath - Ruta de origen.
* @param {String} targetPath - Ruta de destino.
*/
exports.copyFile = (sourcePath, targetPath) => {
  fs.createReadStream(sourcePath).pipe(fs.createWriteStream(targetPath))
}

/**
* Devuelve la cantidad de ficheros existentes dentro de un directorio.
* @param {String} dirPath           - Ruta del directorio.
* @param {String} [ext='.js']        - Se contarán todos los ficheros que tengan esta extensión.
* @param {Boolean} [recursive=true] - Indica si se buscarán dentro de los subdirectorios.
* @return {Number}
*/
exports.countFiles = (dirPath, ext = '.js', recursive = true) => {
  let sw = false
  function _count (dirPath) {
    if (fs.statSync(dirPath).isDirectory()) {
      if (!recursive && sw) { return 0 }
      sw = true
      let count = 0
      fs.readdirSync(dirPath).forEach(fileName => {
        count += _count(path.resolve(dirPath, fileName))
      })
      return count
    } else {
      return dirPath.endsWith(ext) ? 1 : 0
    }
  }
  return _count(dirPath)
}
