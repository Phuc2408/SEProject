const returnList = document.getElementById('returnList');

// Fetch list of book returns
async function fetchReturns() {
    try {
        const response = await fetch('/api/admin/returns', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch returns');

        const returns = await response.json();
        displayReturns(returns);
    } catch (error) {
        console.error('Error fetching returns:', error.message);
    }
}

// Display returns in the table
function displayReturns(returns) {
    returnList.innerHTML = ''; // Clear previous content

    if (returns.length === 0) {
        returnList.innerHTML = '<tr><td colspan="4" class="text-center p-4">No book returns for today</td></tr>';
        return;
    }

    returns.forEach(returnItem => {
        const username = returnItem.username ? returnItem.username : 'N/A'; // Hiển thị N/A nếu username không tồn tại

        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100'); // Add row styles

        row.innerHTML = `
            <td class="p-4 border text-center">${returnItem.bookTitle}</td>
            <td class="p-4 border text-center">${username}</td>
            <td class="p-4 border text-center">${new Date(returnItem.returnDate).toLocaleDateString()}</td>
            <td class="p-4 border text-center">
                <button class="btn-success" onclick="confirmReturn('${returnItem._id}')">Confirm Return</button>
            </td>
        `;
        returnList.appendChild(row);
    });
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have logged out.');
    window.location.href = '/statics/signin/index.html';
});

// Confirm return
async function confirmReturn(returnId) {
    try {
        console.log('Return ID being confirmed:', returnId);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found. Please log in again.');

        const response = await fetch(`/api/admin/confirm-return/${returnId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();
        console.log('Response from server:', result);

        if (!response.ok) throw new Error(result.message || 'Failed to confirm return');

        alert('Return confirmed successfully!');
        fetchReturns(); // Refresh the list
    } catch (error) {
        console.error('Error confirming return:', error.message);
        alert(`Failed to confirm return: ${error.message}`);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchReturns);
