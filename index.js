import express, {request, response} from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

app.use(express.json())

const PORT = process.env.PORT || 3000

let mockUsers = [
    {id: 1, username: "maxollu", displayName: "Maxollu"},
    {id: 2, username: "lirika", displayName: "LiRiKa"},
    {id: 3, username: "sl1kers", displayName: "Sl1kers"},
]

app.get("/", (request, response) => {
    response.status(201).send({ msg: "Hello!" })
})

app.get("/api/users", (request, response) => {
    console.log(request.query)
    const { query: { filter, value } } = request
    if (filter && value) return  response.send(
        mockUsers.filter((user) => user[filter].includes(value))
    )
    return response.send(mockUsers)
})

app.post('/api/users', (request, response) => {
    const {username, email, password } = request.body
    console.log(username)
    const user = mockUsers.find(item => item.username === username)
    if(user !== undefined) {
        console.log(user, username)
        return response.status(200).send(user)
    }
    if (!username || !email || !password) {
        return response.status(400).send({msg: 'Missing required fields' })
    }

    const newUser = {
        id: mockUsers.length + 1,
        username,
        displayName: username
    }

    mockUsers.push(newUser)

    console.log('New user added: ', newUser)
    return response.status(200).send(newUser)
})

app.get('/api/users/:id', (request, response) => {
    console.log(request.params)
    const parsedId = parseInt(request.params.id)
    console.log(parsedId)
    if(isNaN(parsedId))
        return response.status(400).send({ msg: "Bad Request. Invalid ID."})
    const findUser = mockUsers.find((user) => user.id === parsedId)
    if(!findUser) return  response.sendStatus(404)
    return response.send(findUser)
})

app.listen(PORT, () => {
    console.log(`Сервер запущенно на PORT: ${PORT}`)
})