const pickupList = document.getElementById('pickupList');

// Fetch list of book pickups
async function fetchPickups() {
    try {
        const response = await fetch('/api/admin/pickups', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch pickups');

        const pickups = await response.json();
        window.originalPickupData = pickups; // Lưu dữ liệu gốc
        displayPickups(pickups);
    } catch (error) {
        console.error('Error fetching pickups:', error.message);
    }
}

// Display pickups in the table
function displayPickups(data) {
    pickupList.innerHTML = ''; // Clear previous content

    if (data.length === 0) {
        pickupList.innerHTML = '<tr><td colspan="4" class="text-center p-4">No pickups found</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4 border">${item.bookTitle}</td>
            <td class="p-4 border">${item.username || 'N/A'}</td>
            <td class="p-4 border">${new Date(item.borrowDate).toLocaleDateString()}</td>
            <td class="p-4 border">
                <button class="btn-success" onclick="confirmPickup('${item._id}')">Confirm</button>
            </td>
        `;
        pickupList.appendChild(row);
    });
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have logged out.');
    window.location.href = '/statics/signin/index.html';
});

// Confirm pickup
async function confirmPickup(pickupId) {
    try {
        console.log('Pickup ID being confirmed:', pickupId);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found. Please log in again.');

        const response = await fetch(`/api/admin/confirm-pickup/${pickupId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();
        console.log('Response from server:', result);

        if (!response.ok) throw new Error(result.message || 'Failed to confirm pickup');

        alert('Pickup confirmed successfully!');
        fetchPickups(); // Refresh the list
    } catch (error) {
        console.error('Error confirming pickup:', error.message);
        alert(`Failed to confirm pickup: ${error.message}`);
    }
}

// Filter pickups by date
function filterByDate() {
    const startDate = new Date(document.getElementById('filterStartDate').value);
    const endDate = new Date(document.getElementById('filterEndDate').value);
    const originalData = window.originalPickupData || []; // Dữ liệu gốc từ API

    if (!startDate || !endDate || startDate > endDate) {
        alert('Please select a valid date range.');
        return;
    }

    // Lọc dữ liệu trả sách theo ngày
    const filteredData = originalData.filter(item => {
        const pickupDate = new Date(item.borrowDate);
        return pickupDate >= startDate && pickupDate <= endDate;
    });

    displayPickups(filteredData); // Hiển thị dữ liệu đã lọc
}


// Reset filter
function resetFilter() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    displayPickups(window.originalPickupData || []); // Display original data
}
document.getElementById('applyFilter').addEventListener('click', filterByDate);

document.getElementById('resetFilter').addEventListener('click', () => {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    displayPickups(window.originalPickupData || []); // Hiển thị dữ liệu gốc
});

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchPickups);
