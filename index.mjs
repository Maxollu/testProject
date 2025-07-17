import express, {request, response} from 'express'

const app = express()
const PORT = process.env.PORT || 3000

const mockUsers = [
    {id: 1, username: "maxollu", displayName: "Maxollu"},
    {id: 2, username: "lirika", displayName: "LiRiKa"},
    {id: 3, username: "sl1kers", displayName: "Sl1kers"},
    {id: 4, username: "niger", displayName: "Niger"},
    {id: 5, username: "hitler", displayName: "Hitler"},
    {id: 6, username: "adolf", displayName: "Adolf"},
    {id: 7, username: "luftwaffe", displayName: "Luftwaffe"},
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

app.get('/api/products', (request, response) => {
    response.send([{ id: 123, name: 'chicken breast', price: 12.99 }])
})

app.listen(PORT, () => {
    console.log(`Сервер запущенно на PORT: ${PORT}`)
})