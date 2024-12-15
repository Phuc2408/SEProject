const search = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const bookDetailsModal = document.getElementById('bookDetailsModal');
const borrowModal = document.getElementById('borrowModal');
const pickupDate = document.getElementById('pickupDate');
const returnDate = document.getElementById('returnDate');
const bookGrid = document.getElementById('book-grid');
const genreFilter = document.getElementById('genreFilter');

let booksData = [];  // To store the fetched books

// Log out function
function logOut() {
    localStorage.clear();
}

// Show book details in the modal
function showBookDetails(bookId) {
    const book = booksData.find(book => book._id === bookId); // Find book by ID
    console.log(book);
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

// Close the book details modal
function closeBookDetailsModal() {
    bookDetailsModal.classList.add('hidden');
}

// Show the borrow modal
let currentBookId = null; // Biến toàn cục lưu bookId

function showBorrowModal(bookId) {
    currentBookId = bookId; // Lưu bookId hiện tại
    const pickupDateInput = document.getElementById('pickupDate');
    const returnDateInput = document.getElementById('returnDate');

    // Tính ngày trả sách mặc định (30 ngày sau ngày mượn)
    const today = new Date();
    pickupDateInput.valueAsDate = today;

    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 30);
    returnDateInput.valueAsDate = returnDate;

    borrowModal.classList.remove('hidden');
}


// Close the borrow modal
function closeBorrowModal() {
    borrowModal.classList.add('hidden');
}

// Filter books by genre
function filterBooksByGenre() {
    const selectedGenre = genreFilter.value;
    bookGrid.innerHTML = '';

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

// Create a book element for the grid
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

    // Add an event listener to show book details when clicked
    bookElement.addEventListener('click', () => showBookDetails(book._id));
    return bookElement;
}

// Handle infinite scroll
let loadedBooks = 0;
window.addEventListener('scroll', function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (loadedBooks >= booksData.length) return;

        loadMoreBooks();
    }
});

// Load more books when scrolling down
function loadMoreBooks() {
    const bookGrid = document.getElementById('book-grid');
    const booksToLoad = 4; // Load 4 more books at a time
    const books = booksData.slice(loadedBooks, loadedBooks + booksToLoad);

    books.forEach(book => {
        bookGrid.appendChild(createBookElement(book));
    });

    loadedBooks += booksToLoad;
}

// Event listener for the genre filter
genreFilter.addEventListener('change', filterBooksByGenre);

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
