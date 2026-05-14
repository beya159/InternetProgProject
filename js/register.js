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
        // Email regex: standard email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidPassword(value) {
        // Password regex: At least 6 characters, at least 1 uppercase, 1 lowercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);
    }

    function registerWithReqres(email, password, onSuccess, onError) {
        var request = new XMLHttpRequest();

        request.open('POST', 'https://reqres.in/api/register', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('x-api-key', 'pro_587d68e4bda8cd4aa3a17cfa11f10a1981478f266e2e043a');

        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }

            var data = {};

            try {
                data = JSON.parse(request.responseText || '{}');
            } catch (error) {
                data = {};
            }

            if (request.status >= 200 && request.status < 300) {
                onSuccess(data);
                return;
            }

            onError(data && data.error ? data.error : 'Registration failed.');
        };

        request.send(JSON.stringify({
            email: email,
            password: password
        }));
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

            if (!isValidPassword(password)) {
                setMessage('Password must be at least 6 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 number.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                setMessage('Passwords do not match.', 'error');
                return;
            }

            setMessage('Creating account...', 'info');

            registerWithReqres(email, password, function (data) {
                // Store account in localStorage regardless of ReqRes response
                var users = JSON.parse(localStorage.getItem('jewelry_users') || '{}');

                if (users[email.toLowerCase()]) {
                    setMessage('Email is already registered.', 'error');
                    return;
                }

                users[email.toLowerCase()] = password;
                localStorage.setItem('jewelry_users', JSON.stringify(users));

                Auth.setUser({
                    name: name,
                    email: email,
                    displayName: name,
                    token: data.token || 'local_token_' + Math.random().toString(36).substr(2, 9)
                });

                setMessage('Registration successful. Redirecting to your profile...', 'success');
                showSuccess('<p>Your account is ready.</p><p><a href="profile.html">Go to profile</a></p>');
                window.setTimeout(function () {
                    window.location.href = 'profile.html';
                }, 1200);
            }, function () {
                // Even if ReqRes fails, still register locally
                var users = JSON.parse(localStorage.getItem('jewelry_users') || '{}');

                if (users[email.toLowerCase()]) {
                    setMessage('Email is already registered.', 'error');
                    return;
                }

                users[email.toLowerCase()] = password;
                localStorage.setItem('jewelry_users', JSON.stringify(users));

                Auth.setUser({
                    name: name,
                    email: email,
                    displayName: name,
                    token: 'local_token_' + Math.random().toString(36).substr(2, 9)
                });

                setMessage('Registration successful. Redirecting to your profile...', 'success');
                showSuccess('<p>Your account is ready.</p><p><a href="profile.html">Go to profile</a></p>');
                window.setTimeout(function () {
                    window.location.href = 'profile.html';
                }, 1200);
            });
        });
    });
})();