const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find( user => user.username === username )

  if (!user) {
    return response.status(404).json({
      error: "There is no such username!"
    })
  }

  request.user = user

  return next()
}


app.post('/users', (request, response) => {
  const { name, username } = request.body

  //Verificando se o name já existe
  const userExists = users.some((user) => user.name === name)
  const usernameExists = users.some((user) => user.username === username)

  if (userExists || usernameExists) {
    return response.status(400).json({
      error: "Name or username already exists!"
    })
  }

  //Criando novo usuário
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  if ((user.todos).length == 0) {
    return response.status(400).json({
      error: "User has no todo!"
    })
  }

  var updated = false

  for (const todo of user.todos) {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = new Date(deadline)
      var result = todo
      updated = true
    }
  }
  if (!updated) {
    return response.status(400).json({ error: `There is no todo in this username with id ${id}`})
  }

  return response.status(200).json(result)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  var updated = false

  for (const todo of user.todos) {
    if (todo.id === id) {
      todo.done = true
      var result = todo
      updated = true
    }
  }

  if (!updated) {
    return response.status(404).json({ error: "Todo id not found!"})
  }

  return response.status(200).json(result)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  var updated = false
  for (const todo of user.todos) {
    if (todo.id === id) {
      (user.todos).splice( (user.todos).indexOf(todo), 1 )
      updated = true
    }
  }

  if (!updated) {
    return response.status(404).json({ error: "Todo id not found!"})
  }

  return response.status(200).send()
});

module.exports = app;