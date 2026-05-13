// Simple client-side auth helpers (demo)
(function(){
    function login(username, password) {
        // Demo: accept any non-empty username
        if (!username) return { success: false, message: 'Enter a username' };
        var user = { username: username };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user: user };
    }

    function logout() {
        localStorage.removeItem('currentUser');
    }

    function getCurrentUser() {
        try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e){ return null; }
    }

    window.Auth = {
        login: login,
        logout: logout,
        currentUser: getCurrentUser
    };
})();
