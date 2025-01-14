document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;

    if (!token || role !== 'admin') {
        alert('Access denied. Redirecting to login page.');
        window.location.href = '../signin/index.html';
        return;
    }

    const addBookModal = document.getElementById('addBookModal');
    const addBookForm = document.getElementById('addBookForm');
    const bookTableBody = document.getElementById('bookTable').querySelector('tbody');

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        alert('Logged out successfully.');
        window.location.href = '../signin/index.html';
    });

    // Open modal
    document.getElementById('addBookBtn').addEventListener('click', () => {
        addBookModal.classList.remove('hidden');
    });

    // Close modal
    window.closeAddBookModal = () => {
        addBookModal.classList.add('hidden');
    };

    // Fetch books
    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/books', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch books');
            const books = await response.json();
            renderBooks(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            alert('Failed to load books.');
        }
    }

    // Render books
    function renderBooks(books) {
        bookTableBody.innerHTML = books.map(book => `
            <tr>
                <td class="border px-4 py-2">${book.title}</td>
                <td class="border px-4 py-2">${book.author}</td>
                <td class="border px-4 py-2">${book.genre}</td>
                <td class="border px-4 py-2">${book.year}</td>
                <td class="border px-4 py-2">
                    <button onclick="deleteBook('${book._id}')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Add book
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const genre = document.getElementById('bookGenre').value;
        const year = document.getElementById('bookYear').value;
        const file = document.getElementById('bookCover').files[0]; // Lấy file ảnh

        const formData = new FormData(); // Sử dụng FormData
        formData.append('title', title);
        formData.append('author', author);
        formData.append('genre', genre);
        formData.append('year', year);
        formData.append('image', file); // Thêm file ảnh vào FormData

        try {
            const response = await fetch('http://localhost:5000/api/admin/books', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Không cần 'Content-Type' khi dùng FormData
                },
                body: formData, // Gửi FormData làm body
            });

            if (!response.ok) {
                const data = await response.json(); // Lấy thông báo lỗi từ server
                throw new Error(data.message || 'Failed to add book');
            }

            closeAddBookModal();
            fetchBooks();
        } catch (error) {
            console.error('Error adding book:', error);
            alert(error.message); // Hiển thị thông báo lỗi chi tiết
        }
    });

    // Delete book
    window.deleteBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete book');
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book.');
        }
    };

    // Initialize
    fetchBooks();
});
