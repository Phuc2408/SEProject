document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Ngăn form reload trang

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Kiểm tra trường nhập
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        // Gửi yêu cầu tới API `/signin`
        const response = await fetch('http://localhost:5000/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Login failed');
            return;
        }

        const data = await response.json();
        console.log('Response data:', data);
        // Kiểm tra nếu người dùng bị cấm
        if (data.isBanned) {
            alert('Your account is banned. Please contact support.');
            return;
        }

        // Lưu đối tượng người dùng vào localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Lưu token riêng biệt
        localStorage.setItem('token', data.token);

        // Chuyển hướng dựa trên vai trò
        if (data.user.role === 'admin') {
            window.location.href = "/statics/admin/index.html"; // Trang dành cho admin
        } else {
            window.location.href = '/statics/homepage/index.html'; // Trang dành cho user
        }
    } catch (error) {
        console.error('Error during signin:', error);
        alert('An error occurred. Please try again later.');
    }
});
