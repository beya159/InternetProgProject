(function () {
    function readCookie(name) {
        var cookieName = encodeURIComponent(name) + '=';
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf(cookieName) === 0) {
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
        if (!value) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
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
        deleteCookie('jewelry_profile_data');
        deleteCookie('jewelry_last_order');
    }

    function isLoggedIn() {
        var user = getAuthUser();
        return !!(user && user.token);
    }

    function getProfileData() {
        return safeParse(readCookie('jewelry_profile_data')) || {};
    }

    function setProfileData(profileData) {
        writeCookie('jewelry_profile_data', JSON.stringify(profileData), 30);
    }

    function getLastOrder() {
        return safeParse(readCookie('jewelry_last_order'));
    }

    function setLastOrder(orderData) {
        writeCookie('jewelry_last_order', JSON.stringify(orderData), 7);
    }

    function clearLastOrder() {
        deleteCookie('jewelry_last_order');
    }

    function getDisplayName(user) {
        if (!user) {
            return '';
        }

        return user.displayName || user.name || user.email || '';
    }

    window.Auth = {
        currentUser: getAuthUser,
        setUser: setAuthUser,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getProfileData: getProfileData,
        setProfileData: setProfileData,
        getLastOrder: getLastOrder,
        setLastOrder: setLastOrder,
        clearLastOrder: clearLastOrder,
        getDisplayName: getDisplayName
    };

    document.addEventListener('DOMContentLoaded', function () {
        var cartLinks = document.querySelectorAll('.cart-btn');

        for (var i = 0; i < cartLinks.length; i++) {
            cartLinks[i].addEventListener('click', function (event) {
                if (!isLoggedIn()) {
                    event.preventDefault();
                    window.location.href = 'login.html?message=' + encodeURIComponent('Please log in to access your cart.');
                }
            });
        }
    });
})();