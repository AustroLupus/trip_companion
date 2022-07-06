const { Pool } = require('pg')

const pool = new Pool({
  user: 'ziggywlz',
  host: 'localhost',
  database: 'DATABASE',
  port: 5432,
  password: '1234',
  max: 20,
  min: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000
})

async function get_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from users where email=$1',
    values: [email]
  })

  client.release()

  return rows[0]
}

async function create_user(name, email, password) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into users (name, email, password) values ($1, $2, $3)',
    values: [name, email, password]
  })

  client.release()

}

async function create_admin(name, email, password) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into users (name, email, password, es_admin) values ($1, $2, $3, $4)',
    values: [name, email, password, true]
  })

  client.release()

}

async function checkadmin (){
  const client = await pool.connect()

  const {rows} = await client.query({
    text: 'select * from users'
  })
  client.release()
  return rows

}
async function add_question(question,correct,fakeA,fakeB){
  const client = await pool.connect()
  
  await client.query({
    text: 'insert into questions (question,answer,fake_one,fake_two) values ($1, $2, $3, $4)',
    values: [question, correct, fakeA, fakeB]
  })
  client.release()
}

async function get_preguntas(){
  const client = await pool.connect()

  const {rows} = await client.query({
    text: 'select * from questions order by random() limit 3'
  })
  client.release()
  return rows
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function check_respuesta(id,pregunta){
  const client = await pool.connect()
  const {rows} = await client.query({
    text: 'select answer=$1 as revision from questions where id=$2',
    values: [pregunta,id]
  })
  client.release()
  return rows[0].revision
}

async function add_score(id,score){
  const client = await pool.connect()
  await client.query({
    text: 'insert into puntajes (id_user,score) values ($1, $2)',
    values: [id, score]
  })
  client.release()
}

async function get_scores(){
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select users.name, puntajes.score from puntajes join users on puntajes.id_user=users.id'
  })
  client.release()
  return rows
}

async function find_user(user){
  const client = await pool.connect()

  const { rows } = await client.query({
    text: "select users.name, puntajes.score from puntajes join users on puntajes.id_user=users.id where users.name like %$1%",
    values: [user]
  })
  client.release()
  return rows
}

module.exports = {
  get_user, create_user, checkadmin, create_admin, add_question, get_preguntas, shuffle,check_respuesta, add_score, get_scores, find_user
}

