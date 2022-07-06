const express = require('express')
const bcrypt = require('bcrypt')
const { get_user, create_user, checkadmin, create_admin, get_preguntas, shuffle
} = require('../db.js')

const router = express.Router()

router.get('/login', async (req, res) => {
  const errors = req.flash('errors')


  res.render('login.html', { errors })
})

router.post('/login', async (req, res) => {
  return res.send(JSON.stringify(req.body))

  // 0. Recuperamos los campos del formulario
  const email = req.body.email
  const password = req.body.password

  // 1. Revisamos si efectivamente existe el usuario
  const user_encontrado = await get_user(email)
  if (!user_encontrado) {
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta')
    return res.redirect('/login')
  }
  //  2. Revisamos que las contraseñas coincidan
  const son_iguales = await bcrypt.compare(password, user_encontrado.password)
  if (!son_iguales) {
    req.flash('errors', 'Usuario inexistente o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 4. Guardamos al usuario en sesion
  req.session.user = user_encontrado

  // 3. Redirigir al usuario al Home
  res.redirect('/')
})

router.get('/register', async (req, res) => {
  const errors = req.flash('errors')
  res.render('register.html', { errors })
})

router.post('/register', async (req, res) => {
  return res.send(JSON.stringify(req.body))
  // 1. Recuperar los campos del formulario
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const password_confirm = req.body.password_confirm

  // 2. Validar que ambas contraseñas sean iguales
  if (password != password_confirm) {
    req.flash('errors', 'Las contraseñas no coinciden')
    return res.redirect('/register')
  }
  
  // 3. Validar que no exista otro usuario con el mismo correo
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Este email ya se encuentra registrado')
    return res.redirect('/register')
  }

  // 4. Finalmente podemos guardar el nuevo usuario en base de datos
  const password_encrypt = await bcrypt.hash(password, 10)
  let miPrueba = await checkadmin()
  if (miPrueba == "") {
    await create_admin(name, email, password_encrypt)
  }else{
    await create_user(name, email, password_encrypt)
  }
  
  // 5. y en la sesión
  req.session.user = {
    name, email, password
  }
  //console.log('session', req.session);

  res.redirect('/')
})

/* router.post('/create_message', async (req, res)=>{
  let userId = await get_userId(req.session.user.name)
  await create_message(userId, req.body.mensajes)
  res.redirect('/')
}) */

/* router.post('/create_comment', async (req, res)=>{
  console.log(req.body)
  let userId = await get_userId(req.session.user.name)
  //console.log(`userId: ${userId}, comentario = ${req.body.comentario}, msg_id: ${req.body.msg_id}`)
  await create_comment(req.body.msg_id, userId, req.body.comentario)
  res.redirect('/')
}) */

router.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/login')
})

module.exports = router