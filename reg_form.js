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

function createUserListItem(item) {
    const li = document.createElement('li');
    li.style.marginBottom = '20px';

    const userInfo = document.createElement('div');
    userInfo.classList.add('user-info');
    userInfo.innerHTML = `
    <p><strong>Username:</strong> <span class="user-username">${item.username}</span></p>
    <p><strong>Email:</strong> <span class="user-email">${item.email}</span></p>
    <p><strong>ID:</strong> <span class="user-id">${item.id}</span></p>
    `;

    li.appendChild(userInfo);

    const editButton = document.createElement('button');
    editButton.textContent = 'Редагувати';
    li.appendChild(editButton);

    const dialog = document.createElement('dialog');

    const title = document.createElement('h3');
    title.textContent = 'Редагування користувача';

    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Змінити username: ';

    const usernameInput = document.createElement('input');
    usernameInput.value = item.username;

    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Змінити email: ';

    const emailInput = document.createElement('input');
    emailInput.value = item.email;

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Змінити';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрити';
    closeButton.style.marginLeft = '10px';

    dialog.appendChild(title);
    dialog.appendChild(usernameLabel);
    dialog.appendChild(usernameInput);
    dialog.appendChild(document.createElement('br'));

    dialog.appendChild(emailLabel);
    dialog.appendChild(emailInput);
    dialog.appendChild(document.createElement('br'));

    dialog.appendChild(submitButton);
    dialog.appendChild(closeButton);

    editButton.addEventListener('click', () => {
        dialog.showModal();
    });

    closeButton.addEventListener('click', () => {
        dialog.close();
    });

    submitButton.addEventListener('click', async () => {
        const newUsername = usernameInput.value.trim();
        const newEmail = emailInput.value.trim();

        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(newEmail)) {
            alert("Email некоректний");
            return;
        }

        const response = await fetch(`http://localhost:3000/api/users/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: newUsername, email: newEmail })
        });

        if (response.ok) {
            dialog.close();
            updateTable();
        } else {
            alert('Помилка при оновлені користувача.');
        }
    });

    li.appendChild(dialog);
    return li;
}

async function updateTable() {
    tableUl.innerHTML = '';

    try{
        const response = await usersTable();
        if (!response.ok) {
            tableUl.textContent = 'Помилка отримання користувача.';
            return;
        }
        response.data.users.forEach(user => {
            const li = createUserListItem(user);
            tableUl.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        tableUl.textContent = 'Сталася помилка при завантаженні користувачів.'
    }
}

updateTable();

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const { ok, data } = await searchUser(searchUsername.value);

    searchDiv.textContent = '';
    searchDiv.className = '';

    if (ok) {
        searchDiv.textContent = `Username: ${data.username} exists with ID: ${data.id} and Email: ${data.email}`;
        searchDiv.classList.add('search-success')
    } else {
        searchDiv.textContent = `Error: ${data.msg || 'Unknown error'}`;
        searchDiv.classList.add('search-error')
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
            createForm.reset();
            updateTable();
        } catch (error) {
            resultDiv.textContent = `Error: ${error.message}`;
        }
    } else {
        resultDiv.textContent = '';
    }
})
