document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Ngừng hành động mặc định (tải lại trang)

    // Lấy giá trị từ các trường đầu vào
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value;
    const phone = document.getElementById('phone').value;

    // Lấy giá trị gender
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    // Kiểm tra thông tin đầu vào
    if (!email || !username || !password || !gender || !name || !id || !phone) {
        alert('Please fill all fields');
        return;
    }

    // Chuẩn bị dữ liệu để gửi đến API
    const userData = {
        email: email,
        username: username,
        password: password,
        name: name,
        id: id,
        phone: phone,
        gender: gender
    };

    try {
        // Gửi yêu cầu POST tới API
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Kiểm tra phản hồi từ API
        if (response.ok) {
            const result = await response.json();
            alert('Sign up successful! Please log in.');
            window.location.href = 'statics/signin.html'; // Chuyển hướng đến trang Sign In
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Something went wrong'}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred. Please try again later.');
    }
});