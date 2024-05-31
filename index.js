let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
const maxId = contacts.length > 0
    ? Math.floor(Math.random() * 100000)
    : 0
return maxId + 1
}

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => JSON.stringify(req.body));
const customMorganFormat = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(express.json())
app.use(cors())
app.use(morgan(customMorganFormat));


app.get('/api/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${contacts.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = contacts.find(person => person.id === id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    contacts = contacts.filter(person => person.id !== id)
    response.status(204).end()
})

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const body = request.body
    const person = {
      name: body.name,
      number: body.number,
      id: id
    }
    contacts = contacts.map(p => p.id !== id ? p : person)
    response.json(person)
})
  

app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    if(contacts.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    contacts = contacts.concat(person)
  
    response.json(person)
  })
  
app.get('/api/persons', (request, response) => {
    response.json(contacts)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)