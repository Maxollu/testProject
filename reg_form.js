const createForm = document.getElementById('registerForm');
const searchForm = document.getElementById('searchForm');
const searchUsername = document.getElementById('searchUsername');
const searchDiv = document.getElementById('searchResult');
const resultDiv = document.getElementById('result');
const tableUl = document.getElementById('usersTable');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const fieldsError = document.getElementById('fieldsError');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

async function fetchData() {
    const response = await fetch('http://localhost:3000/api/users'); // Await the fetch call
    const data = await response.json(); // Await the parsing of the JSON data
    console.log(data);
}

async function createUser(username) {
    const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email.value,
            password: password.value
        })
    })

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.msg || "Unknown error")
    }

    return data;
}

async function searchUser(username){
    const response = await fetch('http://localhost:3000/api/users/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username
        })
    })
    const data = await response.json();
    return {ok: response.ok, data};
}

async function usersTable() {
    const response = await fetch('http://localhost:3000/api/users/table', {
        method: 'GET'
    });
    const data = await response.json();
    return {ok: response.ok, data};
}

function updateTable() {
    tableUl.textContent = '';
    usersTable().then(response => {
        console.log(response.data);
        response.data.users.map(item => {
            console.log(item);

            const user = document.createElement('li');
            user.textContent = `Username: ${item.username}. Email: ${item.email}. ID: ${item.id}.`;
            tableUl.appendChild(user);

            const dialog = document.createElement('dialog');
            tableUl.appendChild(dialog);

            const updateUser = document.createElement('button');
            updateUser.textContent = 'Редагувати';
            tableUl.appendChild(updateUser);
            updateUser.addEventListener('click', () => {

                dialog.showModal();
            })

            const submitUpdate = document.createElement('button');
            submitUpdate.textContent = 'Змінити';

            const message = document.createElement('p');
            message.textContent = 'Тут редагуємо юзера';

            const usernameLabel = document.createElement('label');
            usernameLabel.textContent = 'Змінити username: ';

            const usernameUpdate = document.createElement('input');
            usernameUpdate.value = item.username

            const emailLabel = document.createElement('label');
            emailLabel.textContent = 'Змінити email: ';

            const emailUpdate = document.createElement('input');
            emailUpdate.value = item.email
            dialog.appendChild(message);
            dialog.appendChild(usernameLabel);
            dialog.appendChild(usernameUpdate);
            dialog.appendChild(emailLabel);
            dialog.appendChild(emailUpdate);
            dialog.appendChild(submitUpdate);

            submitUpdate.addEventListener('click', async() => {
                const newUsername = usernameUpdate.value;
                const newEmail = emailUpdate.value;

                if (!newEmail.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
                    alert("Email некоректний");
                    return; // зупиняємо виконання, якщо email невалідний
                }
                const response = await fetch(`http://localhost:3000/api/users/${item.id}`,  {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username: newUsername, email: newEmail})
                })

                if (response.ok) {
                    dialog.close()
                    updateTable()
                } else {
                    console.error("Щось не так")
                }
            })
        });
    });
}

updateTable();

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const { ok, data } = await searchUser(searchUsername.value);

    if (ok) {
        searchDiv.textContent = `Username: ${data.username} exists with ID: ${data.id} and Email: ${data.email}`;
    } else {
        searchDiv.textContent = `Error: ${data.msg || 'Unknown error'}`;
    }
})
createForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    let emailCheck = false;
    let passwordCheck = false;
    let fieldsCheck = false;

    if (!username.value || !email.value || !password.value || !password2.value) {
        fieldsError.textContent = 'All fields are required.';
    } else {
        fieldsError.textContent = '';
        fieldsCheck = true;
    }

    if (password.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long.';
    } else if (password.value !== password2.value) {
            passwordError.textContent = 'The passwords do not match.';
    } else {
        passwordError.textContent = '';
        passwordCheck = true;
    }

    if (!email.value.match((/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/))) {
        emailError.textContent = 'Please enter a valid email!';
    } else {
        emailError.textContent = '';
        emailCheck = true;
    }

    if (emailCheck && passwordCheck && fieldsCheck) {
        try {
            const newUser = await createUser(username.value);
            resultDiv.textContent = `Registration successful! Your nickname: ${username.value}, email: ${email.value}`;
            updateTable();
        } catch (error) {
            resultDiv.textContent = `Error: ${error.message}`;
        }
    } else {
        resultDiv.textContent = '';
    }
})
