
let events = JSON.parse(localStorage.getItem('departmentEvents')) || [
    {
        id: 1,
        department: "Computer Science",
        name: "Tech Symposium 2025",
        date: "2025-03-15",
        time: "10:00",
        location: "Auditorium",
        phone: "+1234567890",
        description: "Annual technology symposium featuring talks from industry experts, workshops, and networking opportunities for computer science students.",
        image: "https://via.placeholder.com/400x200/1a3a5f/ffffff?text=Tech+Symposium"
    },
    {
        id: 2,
        department: "Mathematics",
        name: "Math Olympiad",
        date: "2025-03-20",
        time: "09:00",
        location: "Seminar Hall 2",
        phone: "+1234567891",
        description: "Inter-collegiate mathematics competition with challenging problems and puzzles for math enthusiasts.",
        image: "https://via.placeholder.com/400x200/27ae60/ffffff?text=Math+Olympiad"
    },
    {
        id: 3,
        department: "Chemistry",
        name: "Chemistry Expo",
        date: "2025-04-05",
        time: "11:00",
        location: "Chemistry Building",
        phone: "+1234567892",
        description: "Showcase of chemical experiments, research projects, and demonstrations by chemistry students.",
        image: "https://via.placeholder.com/400x200/e74c3c/ffffff?text=Chemistry+Expo"
    }
];
const departmentSelect = document.getElementById('departmentSelect');
const eventsContainer = document.getElementById('eventsContainer');
const eventModal = document.getElementById('eventModal');
const eventModalContent = document.getElementById('eventModalContent');
const eventFormModal = document.getElementById('eventFormModal');
const eventForm = document.getElementById('eventForm');
const eventFormTitle = document.getElementById('eventFormTitle');
const adminEventControls = document.getElementById('adminEventControls');
let selectedFile = null;
let imagePreviewUrl = '';
function displayEvents() {
    const selectedDept = departmentSelect.value;
    const filteredEvents = selectedDept ? 
        events.filter(event => event.department === selectedDept) : 
        events;
    
    eventsContainer.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = '<p>No events found for the selected department.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.onclick = () => showEventDetails(event);

        const adminControlsHTML = isAdmin ? `
            <div class="admin-controls">
                <button class="edit" onclick="event.stopPropagation(); editEvent(${event.id})">Edit</button>
                <button class="delete" onclick="event.stopPropagation(); deleteEvent(${event.id})">Delete</button>
            </div>
        ` : '';
        
        eventCard.innerHTML = `
            <img src="${event.image}" alt="${event.name}" class="event-image" onerror="this.src='https://via.placeholder.com/400x200/cccccc/666666?text=Event+Image'">
            <div class="event-details">
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p class="event-phone" onclick="event.stopPropagation(); openWhatsApp('${event.phone}')">
                    <strong>Contact:</strong> ${event.phone}
                </p>
                ${adminControlsHTML}
            </div>
        `;
        
        eventsContainer.appendChild(eventCard);
    });
}
function showEventDetails(event) {
   
    const adminControlsHTML = isAdmin ? `
        <div class="admin-controls">
            <button class="edit" onclick="editEvent(${event.id})">Edit</button>
            <button class="delete" onclick="deleteEvent(${event.id})">Delete</button>
        </div>
    ` : '';
    
    eventModalContent.innerHTML = `
        <img src="${event.image}" alt="${event.name}" class="event-modal-image" onerror="this.src='https://via.placeholder.com/600x300/cccccc/666666?text=Event+Image'">
        <div class="event-modal-details">
            <h2>${event.name}</h2>
            <p><strong>Department:</strong> ${event.department}</p>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p class="event-phone" onclick="openWhatsApp('${event.phone}')">
                <strong>Contact:</strong> ${event.phone}
            </p>
            <p><strong>Description:</strong> ${event.description}</p>
            ${adminControlsHTML}
        </div>
    `;
    
    eventModal.style.display = 'block';
}

function openWhatsApp(phone) {
    window.open(`https://wa.me/${phone}`, '_blank');
}
function showAddEventForm() {
    if (!checkAdminPermission()) return;
    
    eventFormTitle.textContent = 'Add New Event';
    eventForm.reset();
    document.getElementById('eventId').value = '';
    resetImageUpload();
    
    const existingDeleteBtn = document.querySelector('.delete-btn');
    if (existingDeleteBtn) {
        existingDeleteBtn.remove();
    }
    
    eventFormModal.style.display = 'block';
}
function editEvent(id) {
    if (!checkAdminPermission()) return;
    
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    eventFormTitle.textContent = 'Edit Event';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventDepartment').value = event.department;
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventPhone').value = event.phone;
    document.getElementById('eventDescription').value = event.description;

    resetImageUpload();

    const formActions = document.querySelector('.form-actions');
    if (formActions && !document.querySelector('.delete-btn')) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete Event';
        deleteBtn.onclick = () => deleteEventFromForm(id);
        formActions.insertBefore(deleteBtn, formActions.firstChild);
    }
    
    eventFormModal.style.display = 'block';
    eventModal.style.display = 'none';
}

function deleteEventFromForm(id) {
    if (!checkAdminPermission()) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== id);
        localStorage.setItem('departmentEvents', JSON.stringify(events));
        displayEvents();
        eventFormModal.style.display = 'none';
    }
}
function deleteEvent(id) {
    if (!checkAdminPermission()) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== id);
        localStorage.setItem('departmentEvents', JSON.stringify(events));
        displayEvents();
        eventModal.style.display = 'none';
    }
}
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, GIF, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Please select an image smaller than 5MB');
            return;
        }
        
        selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreviewUrl = e.target.result;
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
}
function updateImagePreview() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    
    if (imagePreviewUrl) {
        previewContainer.innerHTML = `
            <div class="file-preview">
                <img src="${imagePreviewUrl}" alt="Preview" class="preview-image">
                <button type="button" class="remove-image" onclick="removeSelectedImage()">Remove Image</button>
            </div>
        `;
        fileUploadContainer.style.display = 'none';
    } else {
        previewContainer.innerHTML = '';
        fileUploadContainer.style.display = 'block';
    }
}


function removeSelectedImage() {
    selectedFile = null;
    imagePreviewUrl = '';
    document.getElementById('imageFile').value = '';
    updateImagePreview();
}
function resetImageUpload() {
    selectedFile = null;
    imagePreviewUrl = '';
    document.getElementById('imageFile').value = '';
    updateImagePreview();
}
function setupDragAndDrop() {
    const fileUploadContainer = document.querySelector('.file-upload-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        fileUploadContainer.classList.add('dragover');
    }
    
    function unhighlight() {
        fileUploadContainer.classList.remove('dragover');
    }
    
    fileUploadContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        document.getElementById('imageFile').files = files;
        handleFileSelect({ target: { files: files } });
    }
}
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!checkAdminPermission()) return;
    
    const id = document.getElementById('eventId').value;
    const department = document.getElementById('eventDepartment').value;
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const phone = document.getElementById('eventPhone').value;
    const description = document.getElementById('eventDescription').value;
    
   
    let imageUrl = '';
    
 
    if (imagePreviewUrl) {
        imageUrl = imagePreviewUrl;
    } else if (id) {
       
        const existingEvent = events.find(e => e.id === parseInt(id));
        imageUrl = existingEvent ? existingEvent.image : 'https://via.placeholder.com/400x200/cccccc/666666?text=Event+Image';
    } else {
        imageUrl = 'https://via.placeholder.com/400x200/cccccc/666666?text=Event+Image';
    }
    
    if (id) {
        const eventIndex = events.findIndex(e => e.id === parseInt(id));
        if (eventIndex !== -1) {
            events[eventIndex] = {
                ...events[eventIndex],
                department,
                name,
                date,
                time,
                location,
                phone,
                description,
                image: imageUrl
            };
        }
    } else {
        const newEvent = {
            id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
            department,
            name,
            date,
            time,
            location,
            phone,
            description,
            image: imageUrl
        };
        events.push(newEvent);
    }
    
    localStorage.setItem('departmentEvents', JSON.stringify(events));
    displayEvents();
    eventFormModal.style.display = 'none';
});
function closeEventFormModal() {
    eventFormModal.style.display = 'none';
}
departmentSelect.addEventListener('change', displayEvents);
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
});
displayEvents();