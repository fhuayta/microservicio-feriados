# Agetic BPM Doc Generator

Generador de Apidoc y Test de Integración para servicios web creados con express.

## Características

- El servicio debe estar creado con [express](https://expressjs.com/es/).
- Utiliza [ava](https://github.com/avajs/ava) para ejecutar los tests y [ApidocJS](http://apidocjs.com/) junto con [Swagger](https://swagger.io/) para construir el apidoc.

## Interfaz de línea de comandos

Esta librería contiene una herramienta CLI, cuya función es generar y procesar todos los ficheros que se requieren para crear la documentación.

### Instalación

```bash
npm install -g git+ssh://git@gitlab.geo.gob.bo:agetic/agetic-bpm-doc-generator.git
```

Para verificar la instalación, ejecutar el comando: `doc --version`

Para ver todas las opciones disponibles: `doc --help` o `doc <comando> --help`

## Configuración del proyecto

Al utilizar esta herramienta, se observan las siguientes modificaciones en el proyecto:

```txt
app
  ├─ doc.json
  ├─ index.js
  └─ package.json
```

### Archivo de configuración `doc.json`

Este archivo, puede ser generado con el comando `doc init`

```json
{
  "buildPath": "doc/build",
  "testPath": "doc/test",
  "templatePath": "doc/template",
  "compilePath": "doc/public/bpm-doc",
  "helpersPath": "doc/helpers",
  "helpersType": "YAML",
  "apiUrl": "http://localhost:4000",
  "apiName": "Apidoc",
  "apiVersion": "1.0.0",
  "apiDescription": "<a href=\"../apidoc\" style=\"background-color: #0062cc;color:white;padding:10px;border-radius:20px;text-decoration:none;font-weight:bold\">APIDOC JS</a>",
  "serverPort": 5000,
  "serverPublic": "doc/public",
  "serverRedirect": "./bpm-doc/swagger",
  "appPath": "index.js"
}
```

### Archivo `package.json`

Estos datos se agregan automáticamente al ejecutar el comando `doc init`

```json
{
  "devDependencies": {
    "agetic-bpm-doc-generator": "git+ssh://git@gitlab.geo.gob.bo:agetic/agetic-bpm-doc-generator.git",
    "ava": "^0.25.0"
  }
}
```

Esta configuración es opcional, en caso de que no se tenga instalado globalmente la libreria.

```json
{
  "scripts": {
    "doc:routes": "NODE_ENV=test ./node_modules/.bin/doc routes",
    "doc:scaffold": "NODE_ENV=test ./node_modules/.bin/doc scaffold",
    "doc:build": "rm -rf doc/build && NODE_ENV=test ./node_modules/.bin/ava doc/test/* --serial --verbose && npm run doc:compile",
    "doc:compile": "./node_modules/.bin/doc compile",
    "doc:server": "./node_modules/.bin/doc server",
    "doc:start": "npm run doc:compile && npm run doc:server"
  }
}
```

## Proceso de creación del apidoc

```bash
# Crea el archivo de configuración
doc init

# Crea los ficheros base
npm run doc:scaffold

# Ejecuta los tests y construye los ficheros que requiere ApidocJS y Swagger.
npm run doc:build

# Compila los ficheros
npm run doc:compile

# Levanta el servidor para visualizar el apidoc
npm run doc:server

# Compila los ficheros y Levanta el servidor
npm run doc:start
```

El siguiente comando, muestra todas las rutas de la aplicación

```bash
npm run doc:routes
```

## Métodos soportados:

```js
await ApidocGenerator.get('api/v1/users').generate()
await ApidocGenerator.post('api/v1/users').generate()
await ApidocGenerator.put('api/v1/users/:id').generate()
await ApidocGenerator.patch('api/v1/users/:id').generate()
await ApidocGenerator.delete('api/v1/users/:id').generate()
```

### Funciones disponibles:

| Función          | Descripción                                                            | Valor por defecto       |
| ---------------- | ---------------------------------------------------------------------- | ----------------------- |
| `name`           | Nombre con el que se identificará a la ruta.                           | `<method>/<path></key>` |
| `group`          | Grupo al que pertenece la ruta.                                        | `<fileName>`            |
| `description`    | Descripción de la ruta.                                                | `null`                  |
| `version`        | Versión.                                                               | `1`                     |
| `permissions`    | Lista de los roles. Ej.: `.permissions(['admin', 'user'])`             | `null`                  |
| `request`        | Indica si se va a ejecutar la petición para crear los datos de salida. | `false`                 |
| `key`            | Palabra clave que se adiciona al final del nombre de la ruta.          | `null`                  |
| `inputData`      | Datos de entrada: `{ headers: {}, params: {}, query: {}, body: {} }`   | `null`                  |
| `outputData`     | Datos de salida: `body`                                                | `null`                  |
| `inputExamples`  | Ejemplos de datos de entrada: `{ title: '', data: obj }`               | `null`                  |
| `outputExamples` | Ejemplos de datos de salida: `{ title: '', data: obj }`                | `null`                  |

**Ejemplo:**

```js
await ApidocGenerator.get('/api/v1/users').generate()
await ApidocGenerator.post('/api/v1/users').inputData({ body; { user: 'admin', pass: '123'} }).generate()
await ApidocGenerator.post('/api/v1/users').inputData({ body; { user: 'admin', pass: '123'} }).name('Autenticar').generate()

await ApidocGenerator.get('/api/v1/users').key('Admin').generate()
await ApidocGenerator.get('/api/v1/users').key('User').generate()

await ApidocGenerator.get('/ruta/verificada').request(true).generate()
```

### Función `execute`

Ejecuta la petición y devuelve el resultado del body.

```js
// Inicializa el objeto
ApidocRequest.init()

// Devuelve una lista de usuarios
const usuarios = await ApidocRequest.get('/api/v1/users').execute()
```

### Función `generate`

Ejecuta una consulta (solamente si la propiedad `request` es igual a `true`), genera el respectivo apidoc y devuelve el resultado de la consulta.

```js
await ApidocGenerator.get('/api/v1/users').generate()

// Devuelve el resultado de la petición
const response = await ApidocGenerator.get('/api/v1/users').generate()
const error = response.error
const body  = response.body
```

### Flujo de ejecución

#### ApidocGenerator

1. Definición de la ruta (method, path)
- Carga la configuración global a nivel de archivo [automático cuando se define la ruta]
- Carga los helpers (propiedades estáticas) [automático cuando se define la ruta]
- Asignación de datos
- generate: Completa los datos faltantes con sus valores por defecto
- generate: Si request === true, ejecuta la petición y actualiza la propiedad output.

#### ApidocRequest

1. Definición de la ruta (method, path)
- Carga los helpers (propiedades estáticas) [manual llamando al método `.loadHelp(groupName)`]
- Asignación de datos
- execute: Ejecuta la petición con los datos actuales
