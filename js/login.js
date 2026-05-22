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
        var loggedInCta = document.getElementById('logged-in-cta');

        if (user && user.token) {
            setMessage('Signed in as ' + (user.displayName || user.email), 'success');
            if (form) {
                form.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-flex';
            }
            if (loggedInCta) {
                loggedInCta.style.display = 'block'; 
            }
        } else {
            if (form) {
                form.style.display = 'grid';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            if (loggedInCta) {
                loggedInCta.style.display = 'none'; 
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

                if (!isValidEmail(email)) {
                    setMessage('Please enter a valid email address.', 'error');
                    return;
                }

                // Gather Remember Me settings
                var rememberMeBox = document.getElementById('remember-me');
                var rememberDaysInput = document.getElementById('remember-days');
                var expiryDays = 1; // default to 1 day session fallback if unchecked

                if (rememberMeBox && rememberMeBox.checked) {
                    expiryDays = rememberDaysInput ? parseInt(rememberDaysInput.value) || 7 : 7;
                }

                // straight to the remote database API (Reqres)
                setMessage('Checking credentials...', 'info');
                loginWithReqres(email, password, function (data) {
                    Auth.setUser({
                        email: email,
                        displayName: email.split('@')[0],
                        token: data.token
                    }, expiryDays); 
                    
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