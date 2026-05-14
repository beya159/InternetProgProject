(function () {
    function setMessage(text, type) {
        var status = document.getElementById('status');
        if (!status) {
            return;
        }

        status.textContent = text;
        status.className = type ? 'status-message ' + type : 'status-message';
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showSuccess(message) {
        var successPanel = document.getElementById('success-panel');
        var form = document.getElementById('register-form');

        if (form) {
            form.style.display = 'none';
        }

        if (successPanel) {
            successPanel.style.display = 'block';
            successPanel.innerHTML = message;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('register-form');

        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var password = document.getElementById('password').value;
            var confirmPassword = document.getElementById('confirm-password').value;

            if (!name) {
                setMessage('Name is required.', 'error');
                return;
            }

            if (!email) {
                setMessage('Email is required.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                setMessage('Enter a valid email address.', 'error');
                return;
            }

            if (!password) {
                setMessage('Password is required.', 'error');
                return;
            }

            if (password.length < 6) {
                setMessage('Password must be at least 6 characters.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                setMessage('Passwords do not match.', 'error');
                return;
            }

            setMessage('Creating account...', 'info');

            fetch('https://reqres.in/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
                .then(function (response) {
                    return response.json().then(function (data) {
                        return {
                            ok: response.ok,
                            data: data
                        };
                    });
                })
                .then(function (result) {
                    if (!result.ok) {
                        throw new Error(result.data && result.data.error ? result.data.error : 'Registration failed.');
                    }

                    Auth.setUser({
                        name: name,
                        email: email,
                        displayName: name,
                        token: result.data.token
                    });
                    setMessage('Registration successful. Redirecting to your profile...', 'success');
                    showSuccess('<p>Your account is ready.</p><p><a href="profile.html">Go to profile</a></p>');
                    window.setTimeout(function () {
                        window.location.href = 'profile.html';
                    }, 1200);
                })
                .catch(function (error) {
                    setMessage(error.message, 'error');
                });
        });
    });
})();