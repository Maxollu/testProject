import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let mockUsers = [
    { id: 1, username: "Max", email: "maximus73@gmail.com", password: '123123', role: 'admin' },
    { id: 2, username: "Dmytro", email: "dmytro54@gmail.com", password: '234234', role: 'user' },
    { id: 3, username: "Nikitos", email: "nikitka228@gmail.com", password: '345345', role: 'user' },
];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.post('/main', (req, res) => {
    const { username, password } = req.body;
    const existingUsername = mockUsers.find(item => item.username === username);
    const existingPassword = mockUsers.find(item => item.password === password);
    if (existingUsername && existingPassword) {
        res.sendFile(path.join(__dirname, 'public', 'main.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'signup.html'));
    }
});

app.get("/", (request, response) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get("/api/users", (request, response) => {
    const { query: { filter, value } } = request;
    if (filter && value) {
        return response.send(mockUsers.filter((user) => user[filter].includes(value)));
    }
    return response.send(mockUsers);
});

app.post('/signup', (request, response) => {
    const { username, email, password } = request.body;
    if (!username || !email || !password) {
        return response.status(400).send({ msg: 'Missing required fields' });
    }

    const existingUsername = mockUsers.find(item => item.username === username);
    const existingEmail = mockUsers.find(item => item.email === email);
    if (existingUsername) {
        return response.status(409).send({ msg: 'User already exists with this username.' });
    } else if (existingEmail) {
        return response.status(409).send({ msg: 'User already exists with this email.' });
    }

    const newUser = {
        id: mockUsers.length + 1,
        username,
        email,
        password,
        role: 'user'
    };

    mockUsers.push(newUser);

    console.log('New user added: ', newUser);
    return response.status(200).send({
        ...newUser,
        role: newUser.role // Додаємо role до відповіді
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = mockUsers.find(
        (user) => user.email === email && user.password === password
    );

    if (!user) {
        return res.status(401).send({ msg: 'Невірний email або пароль.' });
    }

    console.log(`Entered like user: ${user.username}, with ID: ${user.id}`);

    return res.status(200).send({
        msg: 'Успішний вхід',
        user: {
            email: user.email,
            role: user.role,
            username: user.username
        }
    });
});

app.post('/api/users/search', (request, response) => {
    const { username } = request.body;
    const user = mockUsers.find(item => item.username === username);
    if (user !== undefined) {
        console.log(user);
        return response.status(200).send(user);
    } else {
        return response.status(404).send({ msg: "User not found" });
    }
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, authEmail } = req.body;

    const authUser = mockUsers.find(u => u.email === authEmail);
    if (!authUser || authUser.role !== 'admin') {
        return res.status(403).send({ msg: 'Access denied' });
    }

    const user = mockUsers.find(user => user.id == id);
    if (!user) {
        return res.status(404).send({ msg: 'User not found' });
    }

    // Перевірка унікальності username та email (крім поточного користувача)
    const existingUsername = mockUsers.find(u => u.username === username && u.id != id);
    const existingEmail = mockUsers.find(u => u.email === email && u.id != id);

    if (existingUsername) {
        return res.status(409).send({ msg: 'User with this username already exists.' });
    }
    if (existingEmail) {
        return res.status(409).send({ msg: 'User with this email already exists.' });
    }

    // Оновлення даних
    user.username = username;
    user.email = email;
    res.status(200).send(user);
});

app.get('/api/users/table', (request, response) => {
    return response.status(200).send({ users: mockUsers });
});

app.get('/api/users/:id', (request, response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) {
        return response.status(400).send({ msg: "Bad Request. Invalid ID." });
    }
    const findUser = mockUsers.find((user) => user.id === parsedId);
    if (!findUser) {
        return response.sendStatus(404);
    }
    return response.send(findUser);
});

app.delete('/api/users/:id', (req, res) => {
    const { authEmail } = req.body;
    const authUser = mockUsers.find(u => u.email === authEmail);
    if (!authUser || authUser.role !== 'admin') {
        return res.status(403).send({ msg: 'Access denied' });
    }

    const userId = parseInt(req.params.id);
    const userIndex = mockUsers.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).send({ msg: 'Користувача не знайдено' });
    }

    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    return res.status(200).send({ msg: 'Користувач видалений', user: deletedUser });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на PORT: ${PORT}`);
});