// Simple client-side auth helpers (demo)
(function(){
    var PUBLIC_API_KEY = 'pub_1dd0b35f8713fa210832731e5583abefe7c2de1b3f5d3f390b780c4ba5fadf0f';
    var ADMIN_API_KEY = 'pro_10d3327dbdf6f5f6a6bf0bcea95d2b8e58bf5fc96d3ba72be1fcf306344eb4c3';

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

    function getReqresApiKey(url) {
        if (!url) return '';
        if (url.indexOf('/api/login') !== -1) return PUBLIC_API_KEY;
        if (url.indexOf('/api/') !== -1) return ADMIN_API_KEY;
        return '';
    }

    function initReqresHeaders() {
        if (!window.jQuery || !jQuery.ajaxPrefilter) return;

        jQuery.ajaxPrefilter(function(options, originalOptions, jqXHR){
            var key = getReqresApiKey(options.url || '');
            if (key) {
                jqXHR.setRequestHeader('x-api-key', key);
            }
        });
    }

    initReqresHeaders();

    window.Auth = {
        login: login,
        logout: logout,
        currentUser: getCurrentUser
    };
})();
