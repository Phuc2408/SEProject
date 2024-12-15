// Biến toàn cục để lưu dữ liệu sách và bookId hiện tại
let booksData = [];
let currentBookId = null;

// Lấy các phần tử DOM
const search = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const bookDetailsModal = document.getElementById('bookDetailsModal');
const borrowModal = document.getElementById('borrowModal');
const bookGrid = document.getElementById('book-grid');
const genreFilter = document.getElementById('genreFilter');
const pickupDateInput = document.getElementById('pickupDate');
const returnDateInput = document.getElementById('returnDate');

// Hàm đăng xuất
function logOut() {
    localStorage.clear();
}

// Hiển thị chi tiết sách trong modal
function showBookDetails(bookId) {
    const book = booksData.find(book => book._id === bookId);
    const detailsHTML = `
        <div class="flex items-center space-x-6">
            <img src="${book.coverImageUrl}" alt="${book.title} cover" class="w-32 h-48 object-cover rounded-md">
            <div class="space-y-3">
                <h3 class="text-3xl font-semibold text-gray-800">${book.title}</h3>
                <p class="text-lg text-gray-600">by ${book.author}</p>
                <p class="text-sm text-gray-500">Publish Year: ${book.year}</p>
                <p class="text-sm text-gray-500">Genre: ${book.genre}</p>
                <p class="text-gray-700">Description: ${book.description}</p>
            </div>
        </div>
        <div class="flex justify-end space-x-4">
            <button onclick="closeBookDetailsModal()" class="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400">
                Close
            </button>
            <button onclick="showBorrowModal('${book._id}')" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Borrow
            </button>
        </div>
    `;
    document.getElementById('bookDetails').innerHTML = detailsHTML;
    bookDetailsModal.classList.remove('hidden');
}

// Đóng modal chi tiết sách
function closeBookDetailsModal() {
    bookDetailsModal.classList.add('hidden');
}

// Hiển thị modal mượn sách
function showBorrowModal(bookId) {
    currentBookId = bookId;

    // Tự động tính toán ngày trả sách dựa trên ngày mượn
    const today = new Date();
    pickupDateInput.valueAsDate = today;

    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 30);
    returnDateInput.valueAsDate = returnDate;

    borrowModal.classList.remove('hidden');
}

// Đóng modal mượn sách
function closeBorrowModal() {
    borrowModal.classList.add('hidden');
}

// Cập nhật ngày trả sách khi thay đổi ngày mượn
pickupDateInput.addEventListener('change', function () {
    const selectedDate = new Date(this.value);
    const returnDate = new Date(selectedDate);
    returnDate.setDate(selectedDate.getDate() + 30);
    returnDateInput.valueAsDate = returnDate;
});

// Tải sách từ API
async function loadBooks(search = null) {
    try {
        const response = await fetch(`/api/user-books${search ? `?param=${search}` : ''}`);
        booksData = await response.json();
        bookGrid.innerHTML = '';
        booksData.forEach(book => {
            bookGrid.appendChild(createBookElement(book));
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Tạo phần tử sách
function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-400';
    bookElement.innerHTML = `
        <img src="${book.coverImageUrl}" alt="${book.title}" class="w-full h-48 object-cover">
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">${book.title}</h3>
            <p class="text-gray-600">${book.author}</p>
            <p class="mt-2">${book.genre}</p>
        </div>
    `;
    bookElement.addEventListener('click', () => showBookDetails(book._id));
    return bookElement;
}

// Gửi yêu cầu mượn sách
document.getElementById('borrowForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Ngăn form reload trang

    const pickupDate = document.getElementById('pickupDate').value;
    const returnDate = document.getElementById('returnDate').value;

    try {
        const response = await fetch('/api/user-books/borrow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}` // Token phải được lưu trong LocalStorage
            },
            body: JSON.stringify({
                bookId: currentBookId, // Gửi bookId hiện tại
                pickupDate, // Gửi pickupDate từ form
                returnDate
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to borrow book.');
        }

        alert('Book borrowed successfully!');
        closeBorrowModal();
        loadBooks(); // Làm mới danh sách sách
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Failed to borrow book. Please try again.');
    }
});


function searchBooks() {
    const query = search.value.trim().toLowerCase();
    // if (query.length > 0)
    //     loadBooks(query);
}

search.addEventListener('keypress', async (event) => {
    console.log(event.key);
    if (event.key === "Enter") {
        const a = search.value.trim().toLowerCase();
        loadBooks(a);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadBooks();
});

// Bộ lọc thể loại sách
genreFilter.addEventListener('change', () => {
    const selectedGenre = genreFilter.value;
    bookGrid.innerHTML = '';
    const filteredBooks = booksData.filter(book => !selectedGenre || book.genre === selectedGenre);
    filteredBooks.forEach(book => {
        bookGrid.appendChild(createBookElement(book));
    });
});

// Khởi tạo ứng dụng
// document.addEventListener('DOMContentLoaded', loadBooks);
