require('dotenv').config()


const cors = require('cors')
const express = require('express')
const app = express()
const morgan = require('morgan')
const url = process.env.MONGODB_URI
const Person = require('./models/person')
const mongoose = require('mongoose')
const PORT = process.env.PORT

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })

}

const errorHandler = (error, request, response, next) =>{
  console.error(error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}




morgan.token('body', (req) => JSON.stringify(req.body));
const customMorganFormat = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(express.json())
app.use(cors())
app.use(morgan(customMorganFormat))

app.use(express.static('dist'))


app.get('/api/info', (request, response) => {
  const date = new Date();

  Person.collection.countDocuments()
    .then(count => {
      response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`);
    })
});

app.get('/api/persons/:id', (request, response, next) => {
    
    const person = Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      }
      else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    // .catch(error => {
      // console.log(error)
      // response.status(400).send({ error: 'malformatted id' })
    // });
  })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => {
      next(error)
    });
})

app.put('/api/persons/:id', (request, response, next) => {
    // const body = request.body
    const {content, important} = request.body;
    // const person = {
    //   name: body.name,
    //   number: body.number,
    // }

    // Person.findByIdAndUpdate(request.params.id, person, {new: true})
    Person.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
})
  

app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }


    Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return Person.findByIdAndUpdate(existingPerson.id, { number: body.number }, { new: true, runValidators: true });
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });
        return person.save();
      }
    })
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
  })
  
app.get('/api/persons', (request, response) => {
    // response.json(contacts)
    Person.find({}).then(person => {
      response.json(person)
    })
})


app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT)


console.log(`Server running on port ${PORT}`)