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
    
    <button onclick="showBorrowModal()" class="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400">
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
function showBorrowModal() {
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

    const filteredBooks = booksData.filter(book => selectedGenre === '' || book.genre === selectedGenre);

    filteredBooks.forEach(book => {
        bookGrid.appendChild(createBookElement(book));
    });
}

// Search books based on user input
function searchBooks() {
    const query = search.value.trim().toLowerCase();
    suggestions.innerHTML = '';

    if (query) {
        const matches = booksData.filter(book => book.title.toLowerCase().includes(query));
        if (matches.length > 0) {
            matches.forEach(book => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                suggestionItem.textContent = book.title;
                suggestionItem.addEventListener('click', () => {
                    search.value = book.title;
                    suggestions.innerHTML = '';
                    showBookDetails(book._id); // Open book details modal
                });
                suggestions.appendChild(suggestionItem);
            });
            suggestions.classList.remove('hidden');
        } else {
            suggestions.classList.add('hidden');
        }
    } else {
        suggestions.classList.add('hidden');
    }
}


// Function to load books from the server (API)
async function loadBooks() {
    try {
        const response = await fetch('/api/user-books');  // Fetch books from the API
        booksData = await response.json();  // Store the books in the global array

        const bookGrid = document.getElementById("book-grid");
        bookGrid.innerHTML = '';  // Clear the grid before adding new books

        // Create and append book elements to the grid
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

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', function () {
    loadBooks();  // Load books when the page is loaded
});
