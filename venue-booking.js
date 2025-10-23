// Global variables
let bookings = [];
const venueBookingForm = document.getElementById('venueBookingForm');
const bookingsContainer = document.getElementById('bookingsContainer');

// Track if we're editing
let isEditing = false;
let editingId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
});

// Load bookings from database
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('Failed to load bookings');
        bookings = await response.json();
        console.log('Loaded bookings:', bookings); // Debug log
        displayBookings();
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsContainer.innerHTML = '<p>Error loading bookings. Please refresh the page.</p>';
    }
}

// Display bookings
function displayBookings() {
    bookingsContainer.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = `booking-card ${booking.status}`;
        
        const statusClass = booking.status === 'booked' ? 'booked-status' : 'available-status';
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        // Admin controls
        const adminControlsHTML = isAdmin ? `
            <div class="admin-controls">
                <button class="edit" onclick="editBooking(${booking.id})">Edit</button>
                <button class="delete" onclick="deleteBooking(${booking.id})">Delete</button>
            </div>
        ` : '';
        
        // Build the booking card HTML - ensure all fields display
        bookingCard.innerHTML = `
            <div class="availability-status ${statusClass}">${booking.status.toUpperCase()}</div>
            <h4>${booking.eventName || 'N/A'}</h4>
            <p><strong>Department:</strong> ${booking.department || 'N/A'}</p>
            <p><strong>Date:</strong> ${booking.date || 'N/A'}</p>
            <p><strong>Time:</strong> ${booking.startTime || 'N/A'} - ${booking.endTime || 'N/A'}</p>
            <p><strong>Location:</strong> ${booking.location || 'N/A'}</p>
            ${booking.status === 'booked' ? 
                `<div class="suggestions">
                    <h5>Venue is booked. Suggested alternatives:</h5>
                    <p>${getAlternativeVenues(booking.location)}</p>
                </div>` : ''
            }
            ${adminControlsHTML}
        `;
        
        bookingsContainer.appendChild(bookingCard);
    });
}

// Get alternative venues
function getAlternativeVenues(bookedVenue) {
    const allVenues = ["Seminar 1", "Seminar 2", "Seminar 3", "Auditorium"];
    const alternatives = allVenues.filter(venue => venue !== bookedVenue);
    return alternatives.length > 0 ? alternatives.join(', ') : 'No alternatives available';
}

// Check venue availability
function isVenueAvailable(location, date, startTime, endTime, excludeId = null) {
    return !bookings.some(booking => {
        if (excludeId && booking.id === excludeId) return false;
        if (booking.location === location && booking.date === date) {
            // Check for time overlap
            return !(endTime <= booking.startTime || startTime >= booking.endTime);
        }
        return false;
    });
}

// Handle form submission
venueBookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const department = document.getElementById('department').value.trim();
    const eventName = document.getElementById('eventName').value.trim();
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const location = document.getElementById('location').value;
    
    // Validate inputs
    if (!department || !eventName || !date || !startTime || !endTime || !location) {
        alert('Please fill in all fields.');
        return;
    }
    
    const available = isEditing ? true : isVenueAvailable(location, date, startTime, endTime, editingId);
    
    const bookingData = {
        department,
        eventName,
        date,
        startTime,
        endTime,
        location,
        status: available ? 'available' : 'booked'
    };
    
    try {
        if (isEditing && editingId) {
            // Update existing booking
            const response = await fetch(`/api/bookings/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                loadBookings();
                venueBookingForm.reset();
                isEditing = false;
                editingId = null;
                document.querySelector('.booking-form button[type="submit"]').textContent = 'Check Availability & Book';
                alert('Booking updated successfully!');
            } else {
                alert('Error updating booking. Please try again.');
            }
        } else {
            // Add new booking
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                loadBookings();
                venueBookingForm.reset();
                
                if (!available) {
                    alert(`The ${location} is already booked for the selected time. Your booking has been marked as "booked" with alternative suggestions.`);
                } else {
                    alert('Venue booked successfully!');
                }
            } else {
                alert('Error booking venue. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Edit booking (admin only)
function editBooking(id) {
    if (!checkAdminPermission()) return;
    
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    
    // Fill form with booking data
    document.getElementById('department').value = booking.department;
    document.getElementById('eventName').value = booking.eventName;
    document.getElementById('date').value = booking.date;
    document.getElementById('startTime').value = booking.startTime;
    document.getElementById('endTime').value = booking.endTime;
    document.getElementById('location').value = booking.location;
    
    // Set editing mode
    isEditing = true;
    editingId = id;
    document.querySelector('.booking-form button[type="submit"]').textContent = 'Update Booking';
    
    // Scroll to form
    document.querySelector('.booking-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete booking (admin only)
async function deleteBooking(id) {
    if (!checkAdminPermission()) return;
    
    if (confirm('Are you sure you want to delete this booking?')) {
        try {
            const response = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadBookings();
                alert('Booking deleted successfully!');
            } else {
                alert('Error deleting booking. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking. Please try again.');
        }
    }
}

// Check admin permission
function checkAdminPermission() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('Only administrators can perform this action. Please login as admin first.');
        return false;
    }
    return true;
}