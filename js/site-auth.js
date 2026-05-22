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
        try { 
            return JSON.parse(value); 
        } 
        catch (e) { 
            return null; 
        }
    }

    function getAuthUser() {
        return safeParse(readCookie('jewelry_auth_user'));
    }

    // checks for custom rememberMe days values (default to 7
    function setAuthUser(user, days) {
        var expiryDays = (typeof days !== 'undefined') ? days : 7;
        
        writeCookie('jewelry_auth_user', JSON.stringify(user), expiryDays);
        if (user && user.token) {
            writeCookie('jewelry_auth_token', user.token, expiryDays);
        }
    }

    function logout() {
        deleteCookie('jewelry_auth_user');
        deleteCookie('jewelry_auth_token');
        deleteCookie('jewelry_last_order'); 
        window.location.href = 'index.html';
    }

    function isLoggedIn() {
        var user = getAuthUser();
        return !!(user && user.token);
    }

    function setLastOrder(orderData) {
        writeCookie('jewelry_last_order', JSON.stringify(orderData), 1); 
    }

    function getLastOrder() {
        return safeParse(readCookie('jewelry_last_order'));
    }

    function clearLastOrder() {
        deleteCookie('jewelry_last_order');
    }

    function getDisplayName(user) {
        if (!user) return '';
        return user.displayName || user.name || '';
    }

    function getProfileData() {
        return getAuthUser(); 
    }

    function updateHeaderUI() {
        var user = getAuthUser();
        var nameSpan = document.getElementById('account-name');
        if (nameSpan) {
            if (user && isLoggedIn()) {
                nameSpan.innerText = getDisplayName(user) || "User";
            } else {
                nameSpan.innerText = "";
            }
        }
    }

    // EXPOSE METHODS
    window.Auth = {
        currentUser: getAuthUser,
        setUser: setAuthUser, // Can now take custom days: Auth.setUser(user, customDays)
        logout: logout,
        isLoggedIn: isLoggedIn,
        updateHeaderUI: updateHeaderUI,
        setLastOrder: setLastOrder,      
        getLastOrder: getLastOrder,      
        clearLastOrder: clearLastOrder,   
        getDisplayName: getDisplayName,
        getProfileData: getProfileData    
    };

    document.addEventListener('DOMContentLoaded', updateHeaderUI);
})();