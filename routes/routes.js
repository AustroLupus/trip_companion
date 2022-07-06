const express = require('express')
const fs = require('fs').promises
const {add_question,get_preguntas,shuffle, check_respuesta, add_score, get_scores,find_user
} = require('../db.js')

const router = express.Router()

function protected_route (req, res, next) {
  if (!req.session.user) {
    //comentar linea de abajo para trabajar sin rutas protegidas
    return res.redirect('/login')
  }
  next()
}

// RUTAS
router.get('/', protected_route, async (req, res) => {
  res.render('index.html', {user: req.session.user})
})

router.get('/agregar_pregunta', protected_route, (req, res) => {
  
  res.render('agregar_pregunta.html',)
})

router.get('/jugar', protected_route, async (req, res) => {
  let preguntas = await get_preguntas()
  let nuevoObjeto=[]
  for (let pregunta of preguntas) {
    let array1=[]
    let obj1={}
    array1.push(pregunta.answer)
    array1.push(pregunta.fake_one)
    array1.push(pregunta.fake_two)
    shuffle(array1)
    obj1={id:pregunta.id,
      question:pregunta.question,
      p1:array1[0],
      p2:array1[1],
      p3:array1[2]}
    nuevoObjeto.push(obj1)

  }
  //console.log(nuevoObjeto)
  res.render('jugar.html', {nuevoObjeto})
})

router.post('/crear_pregunta', protected_route, async (req, res) => {
  //console.log(req.body)>
  await add_question(req.body.pregunta, req.body.respCorrecta, req.body.respFalsa1,req.body.respFalsa2)
  req.flash('notices', 'Pregunta Creada')
  res.redirect('/agregar_pregunta')
});

router.post('/enviar_respuestas', protected_route, async (req, res) => {
  let pregId =req.body.id
  let puntaje =0
  for (let elId of pregId){
    let nombrePregunta = req.body['radiosp'+elId]
    const pregunta = nombrePregunta
    const revision = await check_respuesta(elId,pregunta)
    if(revision){
      puntaje++
    }
  }
  await add_score(req.session.user.id,puntaje)
  req.flash('notices','Eso estuvo genial '+req.session.user.name+'! Tu puntaje es '+puntaje+' ('+Math.round(puntaje/3*100)+'%)')
  res.redirect('/')
});

router.post('/search_players', protected_route, async (req, res) => {
  const scores = await find_user(req.body.search)
  console.log(req.body.search)
  res.render('index.html',{scores})
});

module.exports = router