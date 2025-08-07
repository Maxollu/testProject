const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');
const toggleText = document.getElementById('toggleText');

let isLogin = true;

function renderForm() {
    authForm.textContent = '';

    if (isLogin) {
        formTitle.textContent = 'Login';
        toggleText.innerHTML = 'Немає аккаунта? <a href="#" id="toggleLink">Зареєструватися</a>';

        authForm.innerHTML = `
             <label for="email">Email</label>
             <input type="email" id="email" name="email"/>
             <div id="emailError" class="error"></div>
             
             <label for="password">Password</label>
             <input type="password" id="password" name="password"/>
             <div id="passwordError" class="error"></div>
             
             <div id="resultDiv"></div>
             <button id="submitBtn">Надіслати</button>
        `;
    } else {
        formTitle.textContent = "Signup";
        toggleText.innerHTML = "Вже є аккаунт? <a href=\"#\" id=\"toggleLink\">Увійти</a>";

        authForm.innerHTML = `
            <label for="username">Username</label>
            <input type="text" id="username" name="username"/>
        
            <label for="email">Email</label>
            <input type="email" id="email" name="email"/>
            <div id="emailError" class="error"></div>
        
            <label for="password">Password</label>
            <input type="password" id="password" name="password"/>
        
            <label for="password2">Repeat password</label>
            <input type="password" id="password2" name="password2"/>
            <div id="passwordError" class="error"></div>
        
            <div id="resultDiv"></div>
            <button id="submitBtn">Надіслати</button>
        `;
    }

    document.getElementById('toggleLink').addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        renderForm();
    });
}

renderForm();

authForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const resultDiv = document.getElementById('resultDiv');

    resultDiv.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';

    if (isLogin) {
        if (!email.value || !password.value) {
            resultDiv.textContent = 'All fields are required.';
            return;
        }

        try {
            const response = await fetch('/login', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Login error");
            }

            localStorage.setItem('authEmail', email.value);
            localStorage.setItem('authPassword', password.value);
            localStorage.setItem('authRole', data.user.role); // Зберігаємо роль

            window.location.href = 'main.html';
        } catch (error) {
            resultDiv.textContent = `Помилка: ${error.message}`;
        }
    } else {
        const username = document.getElementById('username');
        const password2 = document.getElementById('password2');

        let valid = true;

        if (!username.value || !email.value || !password.value || !password2.value) {
            resultDiv.textContent = 'Усі поля обов’язкові!';
            valid = false;
        }

        if (password.value.length < 6) {
            passwordError.textContent = 'Пароль повинен бути мінімум 6 символів.';
            valid = false;
        } else if (password.value !== password2.value) {
            passwordError.textContent = 'Паролі не співпадають.';
            valid = false;
        }

        if (!email.value.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
            emailError.textContent = 'Введи коректний email.';
            valid = false;
        }

        if (!valid) return;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username.value,
                    email: email.value,
                    password: password.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Signup error');
            }

            localStorage.setItem('authEmail', email.value);
            localStorage.setItem('authPassword', password.value);
            localStorage.setItem('authRole', data.role); // Зберігаємо роль

            window.location.href = 'main.html';
        } catch (error) {
            resultDiv.textContent = `Помилка: ${error.message}`;
        }
    }
});