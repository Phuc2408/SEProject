const search = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const bookDetailsModal = document.getElementById('bookDetailsModal');
const borrowModal = document.getElementById('borrowModal');
const pickupDate = document.getElementById('pickupDate');
const returnDate = document.getElementById('returnDate');
const bookGrid = document.getElementById('book-grid');
const genreFilter = document.getElementById('genreFilter');

const bookData = {
    "The Great Gatsby": {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        publishYear: "1925",
        genre: "Fiction",
        description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
        available: true
    },
    "To Kill a Mockingbird": {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        publishYear: "1960",
        genre: "Fiction",
        description: "The story of racial injustice and the loss of innocence in the American South.",
        available: false
    },
    "1984": {
        title: "1984",
        author: "George Orwell",
        publishYear: "1949",
        genre: "Science Fiction",
        description: "A chilling depiction of a totalitarian regime that employs surveillance and propaganda to maintain control.",
        available: true
    },
    "Pride and Prejudice": {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        publishYear: "1813",
        genre: "Romantic",
        description: "A romantic novel that explores the issues of class, marriage, and individuality in 19th-century England.",
        available: false
    },
    "Moby Dick": {
        title: "Moby Dick",
        author: "Herman Melville",
        publishYear: "1851",
        genre: "Adventure",
        description: "The epic tale of Captain Ahab's obsessive quest to hunt down the white whale, Moby Dick.",
        available: true
    },
    "War and Peace": {
        title: "War and Peace",
        author: "Leo Tolstoy",
        publishYear: "1869",
        genre: "History",
        description: "A sweeping narrative of Russian society during the Napoleonic era, exploring themes of love, fate, and history.",
        available: true
    },
    "The Hobbit": {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        publishYear: "1937",
        genre: "Fantasy",
        description: "A fantasy adventure that follows Bilbo Baggins on his journey with a group of dwarves to reclaim their homeland.",
        available: false
    },
    "The Catcher in the Rye": {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        publishYear: "1951",
        genre: "Fiction",
        description: "A story about teenage angst and alienation, narrated by the rebellious Holden Caulfield.",
        available: true
    },
    "The Picture of Dorian Gray": {
        title: "The Picture of Dorian Gray",
        author: "Oscar Wilde",
        publishYear: "1890",
        genre: "Mystery",
        description: "A novel that explores the consequences of vanity and moral corruption through the story of Dorian Gray.",
        available: false
    }
};

const bookTitles = Object.keys(bookData);
let loadedBooks = 0;
function logOut() {
    localStorage.clear();
}

function showBookDetails(bookTitle) {
    const book = bookData[bookTitle];
    const isAvailable = book.available;

    const detailsHTML = `
                <div class="flex items-center space-x-6">
                    <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="${book.title} cover" class="w-32 h-48 object-cover rounded-md">
                    <div class="space-y-3">
                        <h3 class="text-3xl font-semibold text-gray-800">${book.title}</h3>
                        <p class="text-lg text-gray-600">by ${book.author}</p>
                        <p class="text-sm text-gray-500">Publish Year: ${book.publishYear}</p>
                        <p class="text-sm text-gray-500">Genre: ${book.genre}</p>
                        <p class="text-gray-700">Description: ${book.description}</p>
                        <p class="text-sm ${isAvailable ? 'text-green-500' : 'text-red-500'}">
                            Status: ${isAvailable ? 'Available' : 'Unavailable'}
                        </p>
                    </div>
                </div>
                <div class="flex justify-end space-x-4">
                    <button onclick="closeBookDetailsModal()" class="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400">Close</button>
                    <button onclick="${isAvailable ? 'showBorrowModal()' : ''}" 
                            class="px-6 py-2 rounded-md ${isAvailable ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}">
                        Borrow
                    </button>
                </div>
            `;
    document.getElementById('bookDetails').innerHTML = detailsHTML;
    bookDetailsModal.classList.remove('hidden');
}

function closeBookDetailsModal() {
    bookDetailsModal.classList.add('hidden');
}

function showBorrowModal() {
    borrowModal.classList.remove('hidden');
}

function closeBorrowModal() {
    borrowModal.classList.add('hidden');
}

function filterBooksByGenre() {
    const selectedGenre = genreFilter.value;
    bookGrid.innerHTML = '';

    const filteredBooks = bookTitles.filter(title => {
        const book = bookData[title];
        return selectedGenre === '' || book.genre === selectedGenre;
    });

    filteredBooks.forEach(title => {
        bookGrid.appendChild(createBookElement(title));
    });
}

function searchBooks() {
    const query = search.value.trim().toLowerCase();
    suggestions.innerHTML = '';

    if (query) {
        const matches = bookTitles.filter(title => title.toLowerCase().includes(query));
        if (matches.length > 0) {
            matches.forEach(title => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                suggestionItem.textContent = title;
                suggestionItem.addEventListener('click', () => {
                    search.value = title;
                    suggestions.innerHTML = '';
                    showBookDetails(title);
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

search.addEventListener('input', searchBooks);

document.addEventListener('DOMContentLoaded', function () {
    loadMoreBooks();
    genreFilter.addEventListener('change', filterBooksByGenre);
});

function loadMoreBooks() {
    for (let i = 0; i < 4 && loadedBooks < bookTitles.length; i++) {
        bookGrid.appendChild(createBookElement(bookTitles[loadedBooks]));
        loadedBooks++;
    }
}

function createBookElement(title) {
    const book = document.createElement('div');
    book.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-400';
    book.innerHTML = `
                <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="${title} cover" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">${title}</h3>
                </div>
            `;
    book.addEventListener('click', () => showBookDetails(title));
    return book;
}

window.addEventListener('scroll', function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreBooks();
    }
});

bookDetailsModal.addEventListener('click', function (e) {
    if (e.target === bookDetailsModal) {
        closeBookDetailsModal();
    }
});

borrowModal.addEventListener('click', function (e) {
    if (e.target === borrowModal) {
        closeBorrowModal();
    }
});