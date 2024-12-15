const borrowedBooksContainer = document.getElementById('borrowedBooks');
const extendPopup = document.getElementById('extendPopup');
const lostPopup = document.getElementById('lostPopup');

// Fetch borrowed books
async function fetchBorrowedBooks() {
    try {
        const response = await fetch('/api/user-books/borrowed', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Token phải chính xác
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch borrowed books');
        }

        const borrowedBooks = await response.json();
        displayBorrowedBooks(borrowedBooks); // Hiển thị sách mượn
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        borrowedBooksContainer.innerHTML = `<p class="text-red-500">Failed to load borrowed books.</p>`;
    }
}

// Display borrowed books on the page
function displayBorrowedBooks(borrowedBooks) {
    borrowedBooksContainer.innerHTML = ''; // Clear previous content

    if (borrowedBooks.length === 0) {
        borrowedBooksContainer.innerHTML = `<p class="text-gray-500">No borrowed books found.</p>`;
        return;
    }

    borrowedBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'p-4 border rounded mb-4 bg-white shadow-md';
        bookElement.innerHTML = `
            <h3 class="text-lg font-semibold">${book.bookTitle}</h3>
            <p>Borrow Date: ${new Date(book.borrowDate).toLocaleDateString()}</p>
            <p>Return Date: ${new Date(book.returnDate).toLocaleDateString()}</p>
            <p>Status: <span class="${book.status === 'borrowed' ? 'text-green-500' : 'text-red-500'}">${book.status}</span></p>
            <div class="flex justify-end space-x-4 mt-4">
                <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onclick="openExtendPopup('${book._id}', '${book.returnDate}')">Extend</button>

                <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="openLostPopup('${book._id}')">Lost</button>
            </div>
        `;
        borrowedBooksContainer.appendChild(bookElement);
    });
}

let currentBorrowedBookId = null; // Biến toàn cục lưu borrowedBookId

function openExtendPopup(borrowedBookId, currentReturnDate) {
    if (extendPopup) {
        extendPopup.classList.remove('hidden');
        document.getElementById('newReturnDate').value = currentReturnDate; // Gán ngày hiện tại
        document.getElementById('confirmExtend').setAttribute('onclick', `extendBook('${borrowedBookId}')`); // Gán borrowedBookId cho nút Confirm
    } else {
        console.error("Element with ID 'extendPopup' not found");
    }
}



function closeExtendPopup() {
    if (extendPopup) {
        extendPopup.classList.add('hidden');
    }
}

function openLostPopup(borrowedBookId) {
    currentBorrowedBookId = borrowedBookId; // Lưu ID
    if (lostPopup) {
        lostPopup.classList.remove('hidden');
    } else {
        console.error("Element with ID 'lostPopup' not found");
    }
}


function closeLostPopup() {
    if (lostPopup) {
        lostPopup.classList.add('hidden');
    }
}

// Extend book return date
async function extendBook(borrowedBookId) {
    const newReturnDate = document.getElementById('newReturnDate').value;

    try {
        const response = await fetch(`/api/user-books/extend/${borrowedBookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ newReturnDate }),
        });

        if (!response.ok) {
            throw new Error('Failed to extend book.');
        }

        alert('Book return date extended successfully!');
        closeExtendPopup();
        fetchBorrowedBooks(); // Refresh borrowed books list
    } catch (error) {
        console.error('Error extending book:', error);
        alert('Failed to extend book. Please try again.');
    }
}



// Mark book as lost
async function markLost() {
    try {
        const response = await fetch(`/api/user-books/lost/${currentBorrowedBookId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to mark book as lost.');
        }

        alert('Book marked as lost successfully!');
        closeLostPopup();
        fetchBorrowedBooks(); // Refresh danh sách sách mượn
    } catch (error) {
        console.error('Error marking book as lost:', error);
        alert('Failed to mark book as lost. Please try again.');
    }
}



// Call fetchBorrowedBooks when the page is loaded
document.addEventListener('DOMContentLoaded', fetchBorrowedBooks);
