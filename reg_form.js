const form = document.getElementById('registerForm')
const resultDiv = document.getElementById('result')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')
const fieldsError = document.getElementById('fieldsError')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')
const password2 = document.getElementById('password2')
form.addEventListener('submit', async function (event) {
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
        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username:username.value,
                    email: email.value,
                    password: password.value
                })
            })
            if (!response.ok) throw new Error("Server error")
            const data = await response.json()
            console.log('User saved:', data)
        } catch (error) {
            console.log("Error saving user: ", error)
            resultDiv.textContent = 'Something went wrong. Try again.'
        }
    } else {
        resultDiv.textContent = ''
    }
})
