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
        window.originalReturnData = returns; // Lưu dữ liệu gốc
        displayReturns(returns);
    } catch (error) {
        console.error('Error fetching returns:', error.message);
    }
}

// Display returns in the table
function displayReturns(data) {
    const returnList = document.getElementById('returnList');
    returnList.innerHTML = ''; // Xóa nội dung cũ

    if (data.length === 0) {
        returnList.innerHTML = '<tr><td colspan="4" class="text-center p-4">No returns found</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4 border">${item.bookTitle}</td>
            <td class="p-4 border">${item.username || 'N/A'}</td>
            <td class="p-4 border">${new Date(item.returnDate).toLocaleDateString()}</td>
            <td class="p-4 border">
                <button class="btn-success" onclick="confirmReturn('${item._id}')">Confirm</button>
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


function filterByDate() {
    const startDate = new Date(document.getElementById('filterStartDate').value);
    const endDate = new Date(document.getElementById('filterEndDate').value);
    const originalData = window.originalReturnData || []; // Dữ liệu gốc từ API

    if (!startDate || !endDate || startDate > endDate) {
        alert('Please select a valid date range.');
        return;
    }

    // Lọc dữ liệu trả sách theo ngày
    const filteredData = originalData.filter(item => {
        const returnDate = new Date(item.returnDate);
        return returnDate >= startDate && returnDate <= endDate;
    });

    displayReturns(filteredData); // Hiển thị dữ liệu đã lọc
}

function resetFilter() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    displayReturns(window.originalReturnData || []); // Hiển thị lại dữ liệu gốc
}

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchReturns);
