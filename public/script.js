const searchForm = document.getElementById('searchForm');
const searchUsername = document.getElementById('searchUsername');
const searchDiv = document.getElementById('searchResult');
const tableUl = document.getElementById('usersTable');

(async () => {
    const email = localStorage.getItem('authEmail');
    const password = localStorage.getItem('authPassword');

    if (!email || !password) {
        console.log('AuthEmail:', email);
        console.log('AuthPassword:', password);
        window.location.href = 'signup.html';
        return;
    }

    // Перевіряємо авторизацію на сервері
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        localStorage.setItem('authRole', data.user.role); // Зберігаємо роль після перевірки
        console.log('Авторизація пройдена, роль:', data.user.role);
    } catch (err) {
        localStorage.removeItem('authEmail');
        localStorage.removeItem('authPassword');
        localStorage.removeItem('authRole');
        window.location.href = 'signup.html';
    }
})();

function logout() {
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authPassword');
    localStorage.removeItem('authRole');
    window.location.href = 'signup.html';
}

async function fetchData() {
    const response = await fetch('/api/users');
    const data = await response.json();
    console.log(data);
}

async function searchUser(username) {
    const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username
        })
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

async function usersTable() {
    const response = await fetch('/api/users/table', {
        method: 'GET'
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

function createUserListItem(item) {
    const role = localStorage.getItem('authRole');
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

    // Лише для адміна — додаткові кнопки
    if (role === 'admin') {
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

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити користувача';
        deleteButton.style.marginLeft = '20px';

        dialog.appendChild(title);
        dialog.appendChild(usernameLabel);
        dialog.appendChild(usernameInput);
        dialog.appendChild(document.createElement('br'));

        dialog.appendChild(emailLabel);
        dialog.appendChild(emailInput);
        dialog.appendChild(document.createElement('br'));

        dialog.appendChild(submitButton);
        dialog.appendChild(closeButton);
        dialog.appendChild(deleteButton);

        editButton.addEventListener('click', () => {
            dialog.showModal();
        });

        closeButton.addEventListener('click', () => {
            dialog.close();
        });

        deleteButton.addEventListener('click', async () => {
            try {
                const authEmail = localStorage.getItem('authEmail');
                const response = await fetch(`/api/users/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ authEmail })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Delete failed');
                }

                dialog.close();
                updateTable();
                console.log('Deleted user: ', data.user);
            } catch (err) {
                console.log('Помилка: ', err.message);
            }
        });

        submitButton.addEventListener('click', async () => {
            const newUsername = usernameInput.value.trim();
            const newEmail = emailInput.value.trim();
            const authEmail = localStorage.getItem('authEmail');

            if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(newEmail)) {
                alert("Email некоректний");
                return;
            }

            const response = await fetch(`/api/users/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUsername,
                    email: newEmail,
                    authEmail: authEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                dialog.close();
                updateTable();

                const currentEmail = localStorage.getItem('authEmail');
                if (currentEmail === item.email) {
                    localStorage.setItem('authEmail', newEmail);
                    console.log('LocalStorage оновлено: authEmail');
                }
            } else {
                alert(data.msg || 'Помилка при оновленні користувача.');
            }
        });

        li.appendChild(dialog);
    }

    return li;
}

async function updateTable() {
    tableUl.innerHTML = '';

    try {
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
        tableUl.textContent = 'Сталася помилка при завантаженні користувачів.';
    }
}

updateTable();

searchForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const { ok, data } = await searchUser(searchUsername.value);

    searchDiv.textContent = '';
    searchDiv.className = '';

    if (ok) {
        searchDiv.textContent = `Username: ${data.username} exists with ID: ${data.id} and Email: ${data.email}`;
        searchDiv.classList.add('search-success');
    } else {
        searchDiv.textContent = `Error: ${data.msg || 'Unknown error'}`;
        searchDiv.classList.add('search-error');
    }
});