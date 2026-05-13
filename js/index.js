// Show the current user's name in the header if they are logged in.
(function () {
    try {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && currentUser.username) {
            var accountName = document.getElementById('account-name');
            if (accountName) {
                accountName.innerText = currentUser.username;
            }
        }
    } catch (error) {
        // Ignore storage/parsing errors.
    }
})();
