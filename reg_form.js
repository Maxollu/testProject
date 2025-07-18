const form = document.getElementById('registerForm')
const searchForm = document.getElementById('searchForm')
const searchUsername = document.getElementById('searchUsername')
const searchDiv = document.getElementById('searchResult')
const resultDiv = document.getElementById('result')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')
const fieldsError = document.getElementById('fieldsError')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')
const password2 = document.getElementById('password2')
async function fetchData() {
    const response = await fetch('http://localhost:3000/api/users'); // Await the fetch call
    const data = await response.json(); // Await the parsing of the JSON data
    console.log(data);
}

async function postUser(username) {
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
    const data = await response.json()
    console.log('User saved:', data)
    return data
}
searchForm.addEventListener('submit', async function(event) {
    event.preventDefault()
    const searchUser = await postUser(searchUsername.value)
    searchDiv.textContent = `Username: ${searchUser.username} exist with ID: ${searchUser.id}`
})
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
        console.log(username.value)
        await postUser(username.value);
    } else {
        resultDiv.textContent = ''
    }
})
