const express    = require('express')
const bodyParser = require('body-parser')
const cors       = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors({
  'origin'                       : '*',
  'methods'                      : 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'preflightContinue'            : true,
  'Access-Control-Allow-Headers' : '*'
}))

app.use(express.static('public'))

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(` [${req.method}] ${req.url}`)
  }
  next()
})

const router1 = require('./routes/users')(app)
const router2 = require('./routes/custom')(app)

app.get('/ruta/sin/grupo', (req, res, next) => { res.status(200).json({ msg: 'ok' }) })
app.get('/ruta/sin/grupo/dos', (req, res, next) => { res.status(200).json({ msg: 'ok' }) })
app.use('/api/v1/users', router1)
app.use('/api/custom', router2)

if (process.env.NODE_ENV !== 'test') {
  app.listen(4000)
  console.log(' App listening on port 4000')
}

module.exports = app
