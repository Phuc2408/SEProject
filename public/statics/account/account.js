// Load user data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve username from localStorage
    const user = localStorage.getItem(user);

    // If no user is found in localStorage, redirect to sign-in page
    if (!user) {
        alert('User not logged in. Redirecting to sign in page.');
        window.location.href = '../signin/index.html'; // Redirect to sign-in page if no username
        return;
    }

    // Display username in the account section
    document.getElementById('accountName').textContent = username;

    // Retrieve user data from localStorage (e.g., email, phone, etc.)
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    console.log(user);  // Log user data to check its structure

    // Display full name, email, and phone in the form
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;

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