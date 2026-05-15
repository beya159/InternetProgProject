(function () {
    function readCookie(name) {
        var cookieName = encodeURIComponent(name) + '=';
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf(cookieName) == 0) {
                return decodeURIComponent(cookies[i].slice(cookieName.length));
            }
        }
        return '';
    }

    function writeCookie(name, value, days) {
        var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; path=/';
        if (days) {
            var expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            cookie += '; expires=' + expires.toUTCString();
        }
        document.cookie = cookie;
    }

    function deleteCookie(name) {
        document.cookie = encodeURIComponent(name) + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    function safeParse(value) {
        if (!value) return null;
        try { return JSON.parse(value); } catch (e) { return null; }
    }

    function getAuthUser() {
        return safeParse(readCookie('jewelry_auth_user'));
    }

    function setAuthUser(user) {
        writeCookie('jewelry_auth_user', JSON.stringify(user), 7);
        if (user && user.token) {
            writeCookie('jewelry_auth_token', user.token, 7);
        }
    }

    function logout() {
        deleteCookie('jewelry_auth_user');
        deleteCookie('jewelry_auth_token');
        window.location.href = 'index.html';
    }

    function isLoggedIn() {
        var user = getAuthUser();
        return !!(user && user.token);
    }

    function updateHeaderUI() {
        var user = getAuthUser();
        var nameSpan = document.getElementById('account-name');
        if (nameSpan) {
            if (user && isLoggedIn()) {
                nameSpan.innerText = user.displayName || user.name || "User";
            } else {
                nameSpan.innerText = "";
            }
        }
    }

    window.Auth = {
        currentUser: getAuthUser,
        setUser: setAuthUser,
        logout: logout,
        isLoggedIn: isLoggedIn,
        updateHeaderUI: updateHeaderUI
    };

    document.addEventListener('DOMContentLoaded', updateHeaderUI);
})();