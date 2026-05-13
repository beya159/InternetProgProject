
// jQuery + AJAX-based login handler (moved into login.js)
$(function(){
	function qs(name){ var params = new URLSearchParams(window.location.search); return params.get(name); }
	var message = qs('message');

	var $status = $('#status');
	var $form = $('#login-form');
	var $logout = $('#logout-btn');

	function updateUI(){
		var user = Auth.currentUser();
		if (user) {
			$status.text('Logged in as ' + user.username);
			$form.hide();
			$logout.show();
		} else {
			$status.text(message ? decodeURIComponent(message) : '');
			$form.show();
			$logout.hide();
		}
	}

	$form.on('submit', function(e){
		e.preventDefault();
		var u = $('#username').val().trim();
		var p = $('#password').val();
		if (!u) { $status.text('Please enter username'); return; }

		// AJAX to fetch users and validate credentials (demo only)
		$.getJSON('data/users.json')
			.done(function(data){
				var users = data && data.users ? data.users : [];
				var found = users.find(function(x){ return x.username === u && x.password === p; });
				if (found) {
					localStorage.setItem('currentUser', JSON.stringify({ username: u }));
					// Always return to home after login
					window.location.href = 'index.html';
				} else {
					$status.text('Invalid username or password');
				}
			})
			.fail(function(){
				$status.text('Login failed: server error');
			});
	});

	$logout.on('click', function(){
		Auth.logout();
		updateUI();
	});

	updateUI();
});
