
function loginWithGoogle() {
  // Implement your logic for Google login here
  alert('Google login clicked');
}

document.getElementById("registration-form").addEventListener("submit", function(event) {
  event.preventDefault();

  // Fetch form values
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var phone = document.getElementById("phone").value;

  // Implement your logic for user registration here
  alert('Registration successful!');
});
