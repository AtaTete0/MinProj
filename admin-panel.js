let allBookings = [];
let allFeedback = [];
let deleteBookingId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadBookings();
    loadFeedback();
    setupEventListeners();
});

// Check if user is admin
function checkAdminAccess() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        alert('Access Denied! Admin login required.');
        window.location.href = '/';
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchBooking').addEventListener('input', filterBookings);
    document.getElementById('filterLocation').addEventListener('change', filterBookings);
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Load bookings from database
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings');
        allBookings = await response.json();
        displayBookings(allBookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const container = document.getElementById('bookingsTableContainer');
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="no-data">No bookings found.</div>';
        return;
    }
    
    let html = `
        <table class="bookings-table">
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    bookings.forEach(booking => {
        const statusClass = booking.status === 'booked' ? 'status-booked' : 'status-available';
        html += `
            <tr>
                <td>${booking.eventName}</td>
                <td>${booking.department}</td>
                <td>${booking.date}</td>
                <td>${booking.startTime} - ${booking.endTime}</td>
                <td>${booking.location}</td>
                <td><span class="status-badge ${statusClass}">${booking.status.toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewBooking(${booking.id})">View</button>
                        <button class="action-btn delete-btn" onclick="openDeleteModal(${booking.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Filter bookings
function filterBookings() {
    const searchTerm = document.getElementById('searchBooking').value.toLowerCase();
    const locationFilter = document.getElementById('filterLocation').value;
    
    const filtered = allBookings.filter(booking => {
        const matchesSearch = booking.eventName.toLowerCase().includes(searchTerm);
        const matchesLocation = locationFilter === '' || booking.location === locationFilter;
        return matchesSearch && matchesLocation;
    });
    
    displayBookings(filtered);
}

// View booking details
function viewBooking(id) {
    const booking = allBookings.find(b => b.id === id);
    if (!booking) return;
    
    const detailsHTML = `
        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">Event Name:</span>
                <span class="detail-value">${booking.eventName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${booking.department}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${booking.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.startTime} - ${booking.endTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${booking.location}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></span>
            </div>
        </div>
    `;
    
    alert(`Booking Details:\n\nEvent: ${booking.eventName}\nDepartment: ${booking.department}\nDate: ${booking.date}\nTime: ${booking.startTime} - ${booking.endTime}\nLocation: ${booking.location}\nStatus: ${booking.status}`);
}

// Open delete confirmation modal
function openDeleteModal(id) {
    deleteBookingId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteBookingId = null;
}

// Confirm delete
async function confirmDelete() {
    if (deleteBookingId === null) return;
    
    try {
        const response = await fetch(`/api/bookings/${deleteBookingId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Booking deleted successfully!');
            closeDeleteModal();
            loadBookings();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
    }
}

// Load feedback
async function loadFeedback() {
    try {
        allFeedback = JSON.parse(localStorage.getItem('userFeedbacks')) || [];
        displayFeedback(allFeedback);
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

// Display feedback
function displayFeedback(feedbacks) {
    const container = document.getElementById('feedbackContainer');
    
    if (feedbacks.length === 0) {
        container.innerHTML = '<div class="no-data">No feedback received yet.</div>';
        return;
    }
    
    let html = '';
    
    feedbacks.forEach(feedback => {
        const date = new Date(feedback.timestamp).toLocaleString();
        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        
        html += `
            <div class="feedback-card">
                <div class="feedback-header">
                    <span class="feedback-type">${feedback.type.toUpperCase()}</span>
                    <span class="feedback-rating">${stars}</span>
                </div>
                <p class="feedback-message">${feedback.message}</p>
                <div class="feedback-meta">
                    <span>Email: ${feedback.email}</span>
                    <span>${date}</span>
                    <span>Page: ${feedback.page}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Admin logout
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.setItem('isAdmin', 'false');
        window.location.href = '/';
    }
}

// Close modal on outside click
window.addEventListener('click', function(event) {
    const deleteModal = document.getElementById('deleteModal');
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});