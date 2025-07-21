import express, {request, response} from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

app.use(express.json())

const PORT = process.env.PORT || 3000

let mockUsers = [
    {id: 1, username: "Max", email: "maximus73@gmail.com"},
    {id: 2, username: "Dmytro", email: "dmytro54@gmail.com"},
    {id: 3, username: "Nikitos", email: "nikitka228@gmail.com"},
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
    if (!username || !email || !password) {
        return response.status(400).send({msg: 'Missing required fields' })
    }

    const existingUsername = mockUsers.find(item => item.username === username);
    const existingEmail = mockUsers.find(item => item.email === email);
    if (existingUsername) {
        return response.status(409).send({ msg: 'User already exists with this username.' });
    } else if (existingEmail) {
        return response.status(409).send({msg:'User already exist with this email.'})
    }

    const newUser = {
        id: mockUsers.length + 1,
        username,
        email: email
    }

    mockUsers.push(newUser)

    console.log('New user added: ', newUser)
    return response.status(200).send(newUser)
})

app.post('/api/users/search', (request, response) => {
    const {username} = request.body
    const user = mockUsers.find(item => item.username === username)
    if(user !== undefined) {
        console.log(user)
        return response.status(200).send(user)
    } else {
        return response.status(404).send({ msg: "User not found" })
    }
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