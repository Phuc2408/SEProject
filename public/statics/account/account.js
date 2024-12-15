// Load user data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        alert('User not logged in. Redirecting to sign in page.');
        window.location.href = '../signin/index.html'; // Redirect to sign-in page if no username
        return;
    }
    // Log userData to check its structure
    console.log(userData);  // This will show the user object in the console

    // Set form fields with the data from userData
    document.getElementById("accountName").textContent = userData.username || "";
    document.getElementById("name").value = userData.name || "";
    document.getElementById("email").value = userData.email || "";
    document.getElementById("idNumber").value = userData.id || "";
    document.getElementById("phone").value = userData.phone || "";

    const phone = userData.phone; // If no phone number, leave it blank
    document.getElementById('phone').value = phone;
});

// Handle the form submission to update user data in localStorage
document.getElementById('accountForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    const phone = document.getElementById('phone').value.trim();

    if (!phone) {
        alert('Please enter a valid phone number');
        return;
    }

    // Retrieve current user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};

    // Update the phone number in the user data
    userData.phone = phone;

    // Save the updated user data back to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    alert('Phone number saved successfully!');
});