import express, {request, response} from 'express'
import cors from 'cors'
import * as path from "path";

const app = express()
app.use(cors())

app.use(express.json())

const PORT = process.env.PORT || 3000

let mockUsers = [
    {
        id: 1,
        username: "Max",
        email: "maximus73@gmail.com",
        password: '123123',
        role: 'admin',
    },
    {
        id: 2,
        username: "Dmytro",
        email: "dmytro54@gmail.com",
        password: '234234',
        role: 'user',
    },
    {
        id: 3,
        username: "Nikitos",
        email: "nikitka228@gmail.com",
        password: '345345',
        role: 'user',
    },
]

function checkAdmin (req, res, next) {
    const { email, password } = req.body;
    const user = mockUsers.find(
        (u) => u.email === email && u.password === password
    )

    if(!user || user.role !== 'admin') {
        return res.status(403).send({ msg: 'Доступ заборонено' })
    }

    next();
}

app.use(express.static('C:/Users/Max/WebstormProjects/untitled/public')); // Or express.static(path.join(dirname, 'public')) if using a public folder

// Define a route to serve the HTML file
app.get('/signup', (req, res) => {
    res.sendFile(path.join('C:/Users/Max/WebstormProjects/untitled/public', 'signup.html'));
});

app.post('/main', (req, res) => {
    const { username, password } = req.body;
    const existingUsername = mockUsers.find(item => item.username === username);
    const existingPassword = mockUsers.find(item => item.password === password);
    if(existingUsername && existingPassword) {
        res.sendFile(path.join('C:/Users/Max/WebstormProjects/untitled/public', 'main.html'));
    } else {
        res.sendFile(path.join('C:/Users/Max/WebstormProjects/untitled/public', 'signup.html'));
    }
});

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

app.post('/signup', (request, response) => {
    const {username, email, password } = request.body;
    if (!username || !email || !password) {
        return response.status(400).send({msg: 'Missing required fields' })
    }

    const existingUsername = mockUsers.find(item => item.username === username);
    const existingEmail = mockUsers.find(item => item.email === email);
    if (existingUsername) {
        return response.status(409).send({ msg: 'User already exists with this username.' });
    } else if (existingEmail) {
        return response.status(409).send({ msg:'User already exist with this email.'});
    }

    const newUser = {
        id: mockUsers.length + 1,
        username,
        email: email,
        password: password,
        role: 'user'
    };

    mockUsers.push(newUser);

    console.log('New user added: ', newUser);
    return response.status(200).send(newUser);
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = mockUsers.find(
        (user) => user.email === email && user.password === password
    );

    if (!user) {
        return res.status(401).send({ msg: 'Невірний email або пароль.' });
    }

    console.log(`Entered like user: ${user.username}, with ID: ${user.id} and role: ${user.role}`)
    return res.status(200).send({ msg: 'Успішний вхід', user });
});

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

app.put('/api/users/:id', checkAdmin, (request, response) =>{
    const {id} = request.params;
    const {username, email} = request.body;

    const user = mockUsers.find(user => user.id == id);
    if(user) {
        user.username = username;
        user.email = email
        response.status(200).send(user)
    } else {
        response.status(404).send({ msg: "User not found" })
    }
})

app.get('/api/users/table', (request, response) => {
    return response.status(200).send({users: mockUsers});
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

app.delete('/api/users/:id', checkAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = mockUsers.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).send({ msg: 'Користувача не знайдено' });
    }

    const deletedUser = mockUsers.splice(userIndex, 1)[0];

    return res.status(200).send({ msg: 'Користувач видалений', user: deletedUser });
});

app.listen(PORT, () => {
    console.log(`Сервер запущенно на PORT: ${PORT}`)
})