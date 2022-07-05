const express = require('express')
const nunjucks = require('nunjucks')
const session = require('express-session')
const flash = require('connect-flash')
const fileUpload = require('express-fileupload')


const app = express()

// CONFIGURACIONES
app.use(express.static('public'))
app.use(express.static('node_modules/bootstrap/dist'))

nunjucks.configure("templates", {
  express: app,
  autoscape: true,
  watch: true,
});


app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use(session({
  secret: 'mi-clave',
  cookie: { maxAge: 86400000 }
}))

app.use(flash())

// para dejar el user como variable global de los templates
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  next()
})

// RUTAS
app.use(require('./routes/auth.js'))
app.use(require('./routes/routes.js'))

const PORT = 3000
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))
