const form = document.getElementById('registerForm')
const resultDiv = document.getElementById('result')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')
const fieldsError = document.getElementById('fieldsError')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')
const password2 = document.getElementById('password2')
form.addEventListener('submit', function (event) {
    event.preventDefault()
    let emailCheck = false
    let passwordCheck = false
    let fieldsCheck = false

    if (!username.value || !email.value || !password.value || !password2.value) {
        fieldsError.textContent = 'All fields are required.'
    } else {
        fieldsError.textContent = ''
        fieldsCheck = true
    }

    if (password.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long.'
    } else if (password.value !== password2.value) {
            passwordError.textContent = 'The passwords do not match.'
    } else {
        passwordError.textContent = ''
        passwordCheck = true
    }

    if (!email.value.match((/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/))) {
        emailError.textContent = 'Please enter a valid email!'
    } else {
        emailError.textContent = ''
        emailCheck = true
    }

    if (emailCheck && passwordCheck && fieldsCheck) {
        resultDiv.textContent = `Registration successful! Your nickname: ${username.value}, email: ${email.value}`;
    } else {
        resultDiv.textContent = ''
    }
})