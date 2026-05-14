// Show the current user's name in the header if they are logged in.
(function () {
    try {
        var currentUser = window.Auth ? Auth.currentUser() : null;
        if (currentUser) {
            var accountName = document.getElementById('account-name');
            if (accountName) {
                accountName.innerText = Auth.getDisplayName(currentUser);
            }
        }
    } catch (error) {
        // Ignore storage/parsing errors.
    }
})();
