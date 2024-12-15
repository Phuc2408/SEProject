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
        displayPickups(pickups);
    } catch (error) {
        console.error('Error fetching pickups:', error.message);
    }
}

// Display pickups in the table
function displayPickups(pickups) {
    pickupList.innerHTML = ''; // Clear previous content

    if (pickups.length === 0) {
        pickupList.innerHTML = '<tr><td colspan="4" class="text-center p-4">No book pickups for today</td></tr>';
        return;
    }

    pickups.forEach(pickup => {
        const username = pickup.username ? pickup.username : 'N/A'; // Hiển thị N/A nếu username không tồn tại

        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100'); // Add row styles

        row.innerHTML = `
            <td class="p-4 border text-center">${pickup.bookTitle}</td>
            <td class="p-4 border text-center">${username}</td>
            <td class="p-4 border text-center">${new Date(pickup.borrowDate).toLocaleDateString()}</td>
            <td class="p-4 border text-center">
                <button class="btn-success" onclick="confirmPickup('${pickup._id}')">Confirm</button>
            </td>
        `;
        pickupList.appendChild(row);
    });
}


// Confirm pickup
async function confirmPickup(pickupId) {
    try {
        console.log('Pickup ID being confirmed:', pickupId);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found. Please log in again.');

        console.log('Token being used:', token);

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

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchPickups);
