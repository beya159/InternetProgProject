(function () {
    function setMessage(text, type) {
        var status = document.getElementById('status');
        if (!status) {
            return;
        }

        status.textContent = text;
        status.className = type ? 'status-message ' + type : 'status-message';
    }

    function ensureLoggedIn() {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to view your profile.');
            return false;
        }

        return true;
    }

    function populateProfileCard(apiData) {
        document.getElementById('profile-avatar').src = apiData.avatar;
        document.getElementById('api-name').textContent = apiData.first_name + ' ' + apiData.last_name;
        document.getElementById('api-email').textContent = apiData.email;
        document.getElementById('api-company').textContent = 'User ID: ' + apiData.id;
    }

    function populateForm() {
        var user = Auth.currentUser() || {};
        var savedProfile = Auth.getProfileData();

        document.getElementById('display-name').value = savedProfile.displayName || user.displayName || user.name || '';
        document.getElementById('profile-email').value = savedProfile.email || user.email || '';
        document.getElementById('phone').value = savedProfile.phone || '';
        document.getElementById('city').value = savedProfile.city || '';
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!ensureLoggedIn()) {
            return;
        }

        var logoutBtn = document.getElementById('logout-btn');
        var form = document.getElementById('profile-form');

        populateForm();

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                Auth.logout();
                window.location.href = 'login.html';
            });
        }

        fetch('https://reqres.in/api/users/2')
            .then(function (response) { return response.json(); })
            .then(function (payload) {
                populateProfileCard(payload.data);
                populateForm();
                setMessage('Profile loaded from ReqRes.', 'success');
            })
            .catch(function () {
                setMessage('Could not load profile data.', 'error');
            });

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();

                var displayName = document.getElementById('display-name').value.trim();
                var email = document.getElementById('profile-email').value.trim();
                var phone = document.getElementById('phone').value.trim();
                var city = document.getElementById('city').value.trim();

                if (!displayName) {
                    setMessage('Display name is required.', 'error');
                    return;
                }

                if (!email) {
                    setMessage('Email is required.', 'error');
                    return;
                }

                Auth.setProfileData({
                    displayName: displayName,
                    email: email,
                    phone: phone,
                    city: city
                });

                Auth.setUser({
                    name: displayName,
                    email: email,
                    displayName: displayName,
                    token: (Auth.currentUser() && Auth.currentUser().token) ? Auth.currentUser().token : ''
                });

                setMessage('Profile saved to cookie.', 'success');
            });
        }
    });
})();