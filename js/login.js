
// jQuery + AJAX-based login handler using reqres.in (demo API)
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
		if (!u) { $status.text('Please enter email'); return; }

		$.ajax({
			url: 'https://reqres.in/api/login',
			method: 'POST',
			data: { email: u, password: p },
			success: function(response){
				localStorage.setItem('currentUser', JSON.stringify({ username: u, token: response.token || '' }));
				window.location.replace('index.html');
			},
			error: function(xhr){
				var errorMessage = 'Login failed: server error';
				if (xhr.responseJSON && xhr.responseJSON.error) {
					errorMessage = xhr.responseJSON.error;
				}
				$status.text(errorMessage);
			}
		});
	});

	$logout.on('click', function(){
		Auth.logout();
		updateUI();
	});

	updateUI();
});
