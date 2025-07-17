const form = document.getElementById('registerForm')
const resultDiv = document.getElementById('result')
const emailValid = document.getElementById('emailValidation')

form.addEventListener('submit', function (event) {
    event.preventDefault()

    const username = document.getElementById('username').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const password2 = document.getElementById('password2').value

    if (!username || !email || !password || !password2) {
        resultDiv.textContent = 'Заповніть усі поля!';
    } else if (password.length < 6) {
        resultDiv.textContent = 'Пароль має містити щонайменше 6 символів.';
    } else if (password !== password2) {
        resultDiv.textContent = 'Паролі не співпадають.';
    } else if (email.match((/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/))) {
        emailValid.textContent = ''
        resultDiv.textContent = `Реєстрація успішна! Ваш нікнейм: ${username}, email: ${email}`;
    } else {
        emailValid.textContent = 'Введіть коректний email!'
        resultDiv.textContent = ''
    }
})