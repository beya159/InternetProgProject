(function () {
    function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

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

    function getRegisteredPassword(email) {
        var users = JSON.parse(localStorage.getItem('jewelry_users') || '{}');
        return users[email.toLowerCase()] || '';
    }

    function isReqresCredential(email, password) {
        return email.toLowerCase() === 'eve.holt@reqres.in' && password === 'cityslicka';
    }

    function ensureRegisterCta() {
        if (document.querySelector('.register-banner, .register-cta, .register-fallback-cta')) {
            return;
        }

        var form = document.getElementById('login-form');
        if (!form || !form.parentNode) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'register-fallback-cta';

        var link = document.createElement('a');
        link.href = 'register.html';
        link.className = 'secondary-link';
        link.textContent = 'Create account';

        wrapper.appendChild(link);
        form.parentNode.insertBefore(wrapper, form.nextSibling);
    }

    function renderState() {
        var user = Auth.currentUser();
        var form = document.getElementById('login-form');
        var logout = document.getElementById('logout-btn');
        var loggedInCta = document.getElementById('logged-in-cta');

        if (user) {
            setMessage('Signed in as ' + Auth.getDisplayName(user), 'success');

            if (form) {
                form.style.display = 'none';
            }

            if (logout) {
                logout.style.display = 'inline-flex';
            }

            if (loggedInCta) {
                loggedInCta.style.display = 'flex';
            }

            return;
        }

        if (form) {
            form.style.display = 'grid';
        }

        if (logout) {
            logout.style.display = 'none';
        }

        if (loggedInCta) {
            loggedInCta.style.display = 'none';
        }

        setMessage(getQueryParam('message') ? decodeURIComponent(getQueryParam('message')) : '', 'info');
    }

    document.addEventListener('DOMContentLoaded', function () {
        ensureRegisterCta();

        var form = document.getElementById('login-form');
        var logout = document.getElementById('logout-btn');

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();

                var email = document.getElementById('email').value.trim();
                var password = document.getElementById('password').value;

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

                var registeredPassword = getRegisteredPassword(email);

                if (registeredPassword && registeredPassword === password) {
                    Auth.setUser({
                        email: email,
                        displayName: email.split('@')[0],
                        token: 'local_token_' + Math.random().toString(36).substr(2, 9)
                    });

                    setMessage('Login successful. Redirecting...', 'success');
                    window.setTimeout(function () {
                        window.location.href = 'profile.html';
                    }, 500);

                    return;
                }

                if (!isReqresCredential(email, password)) {
                    setMessage('Invalid email or password. Use eve.holt@reqres.in / cityslicka or a registered account.', 'error');
                    return;
                }

                setMessage('Signing in...', 'info');

                fetch('https://reqres.in/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'pro_587d68e4bda8cd4aa3a17cfa11f10a1981478f266e2e043a'
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
                            throw new Error(result.data && result.data.error ? result.data.error : 'Login failed.');
                        }

                        Auth.setUser({
                            email: email,
                            displayName: email.split('@')[0],
                            token: result.data.token
                        });

                        setMessage('Login successful. Redirecting...', 'success');
                        window.setTimeout(function () {
                            window.location.href = 'profile.html';
                        }, 500);
                    })
                    .catch(function (error) {
                        setMessage(error.message, 'error');
                    });
            });
        }

        if (logout) {
            logout.addEventListener('click', function () {
                Auth.logout();
                renderState();
            });
        }

        renderState();
    });
})();
