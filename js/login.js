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
        //to simulate sign in, so that we can log in under "another" username but w the same reqres email 
        //if not local storage, it will just get refused. w local storage, its like an alias
        return users[email.toLowerCase()] || '';
    }

    function loginWithReqres(email, password, onSuccess, onError) {
        var request = new XMLHttpRequest();
        request.open('POST', 'https://reqres.in/api/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                var data = {};
                try { data = JSON.parse(request.responseText || '{}'); } catch (e) { data = {}; }
                if (request.status >= 200 && request.status < 300) {
                    onSuccess(data);
                } else {
                    onError(data.error || 'Login failed.');
                }
            }
        };
        request.send(JSON.stringify({ email: email, password: password }));
    }

    function renderState() {
    if (!window.Auth) return;
    var user = Auth.currentUser();
    var form = document.getElementById('login-form');
    var logoutBtn = document.getElementById('logout-btn');

    if (user && user.token) {
        setMessage('Signed in as ' + (user.displayName || user.email), 'success');
        if (form) {
            form.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-flex';
        }
    } else {
        if (form) {
            form.style.display = 'grid';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        var msg = getQueryParam('message');
        if (msg) {
            setMessage(msg, 'info');
        }
    }
}

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('login-form');
        var logoutBtn = document.getElementById('logout-btn');

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var email = document.getElementById('email').value.trim();
                var password = document.getElementById('password').value;

                if (!email || !password) {
                    setMessage('All fields are required.', 'error');
                    return;
                }

                // try local Storage First
                var registeredPassword = getRegisteredPassword(email);
                if (registeredPassword && registeredPassword == password) {
                    Auth.setUser({
                        email: email,
                        displayName: email.split('@')[0],
                        token: 'local_' + Date.now()
                    });
                    setMessage('Redirecting...', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 800);
                    return;
                }

                // try reqres
                setMessage('Checking credentials...', 'info');
                loginWithReqres(email, password, function (data) {
                    Auth.setUser({
                        email: email,
                        displayName: email.split('@')[0],
                        token: data.token
                    });
                    setMessage('Success! Redirecting...', 'success');
                    setTimeout(function() { window.location.href = 'index.html'; }, 800);
                }, function (err) {
                    setMessage(err, 'error');
                });
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                Auth.logout();
                renderState();
            });
        }

        renderState();
    });
})();