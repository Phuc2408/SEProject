// Ensure the DOM is loaded before executing
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Parse the user string into an object
    const parsedUser = user ? JSON.parse(user) : null;
    const role = parsedUser ? parsedUser.role : null;

    console.log(token);
    console.log(role);

    // Check if user is logged in and has admin access
    if (!token || role !== 'admin') {
        alert('Access denied. Redirecting to login page.');
        window.location.href = '../signin/index.html';
    }

    // Logout function
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('You have logged out.');
        window.location.href = '/statics/signin/index.html';
    });

    // Fetch books and display in the table
    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/books', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                alert('Failed to fetch books. Redirecting to login.');
                window.location.href = '../signin/index.html';
                return;
            }

            const books = await response.json();
            const bookTable = document.getElementById('bookTable').querySelector('tbody');
            bookTable.innerHTML = books.map(book => `
                        <tr>
                            <td class="border px-4 py-2">${book.title}</td>
                            <td class="border px-4 py-2">${book.author}</td>
                            <td class="border px-4 py-2">
                                <button onclick="deleteBook('${book._id}')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    `).join('');
        } catch (error) {
            console.error('Error fetching books:', error);
            alert('An error occurred while fetching books.');
        }
    }

    // Add book
    document.getElementById('addBookBtn').addEventListener('click', async () => {
        const title = prompt('Enter book title');
        const author = prompt('Enter book author');

        if (title && author) {
            try {
                const response = await fetch('http://localhost:5000/api/admin/books', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, author })
                });

                if (!response.ok) {
                    alert('Failed to add book.');
                    return;
                }

                fetchBooks();
            } catch (error) {
                console.error('Error adding book:', error);
                alert('An error occurred while adding the book.');
            }
        }
    });

    // Delete book
    async function deleteBook(bookId) {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                alert('Failed to delete book.');
                return;
            }

            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('An error occurred while deleting the book.');
        }
    }

    // Initial load
    fetchBooks();
});