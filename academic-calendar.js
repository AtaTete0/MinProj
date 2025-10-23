
let calendarNotes = JSON.parse(localStorage.getItem('academicCalendar')) || [
    {
        id: 1,
        year: "2025",
        month: 0, 
        date: 1,
        note: "New Year's Day - University Closed"
    },
    {
        id: 2,
        year: "2025",
        month: 2, 
        date: 15,
        note: "Tech Symposium - Computer Science Department"
    },
    {
        id: 3,
        year: "2025",
        month: 2, 
        date: 20,
        note: "Math Olympiad - Mathematics Department"
    },
    {
        id: 4,
        year: "2025",
        month: 3, 
        date: 5,
        note: "Chemistry Expo - Chemistry Department"
    }
];
const yearSelect = document.getElementById('yearSelect');
const calendarContainer = document.getElementById('calendarContainer');
const noteModal = document.getElementById('noteModal');
const noteModalContent = document.getElementById('noteModalContent');
const noteFormModal = document.getElementById('noteFormModal');
const noteForm = document.getElementById('noteForm');
const noteFormTitle = document.getElementById('noteFormTitle');
const adminCalendarControls = document.getElementById('adminCalendarControls');


const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function displayCalendar() {
    const selectedYear = yearSelect.value;
    
    if (!selectedYear) {
        calendarContainer.innerHTML = '<p>Please select a year to view the calendar.</p>';
        return;
    }
    
    calendarContainer.innerHTML = '';
    for (let month = 0; month < 12; month++) {
        const monthCalendar = document.createElement('div');
        monthCalendar.className = 'month-calendar';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = `${monthNames[month]} ${selectedYear}`;
        
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        const firstDay = new Date(selectedYear, month, 1).getDay();
        const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            const notesForDay = calendarNotes.filter(note => 
                note.year === selectedYear && 
                note.month === month && 
                note.date === day
            );
            
            if (notesForDay.length > 0) {
                dayElement.classList.add('has-note');
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                ${notesForDay.length > 0 ? 
                    `<div class="note-preview">${notesForDay[0].note}</div>` : 
                    ''
                }
            `;
            
            dayElement.onclick = () => showDayNotes(selectedYear, month, day);
            
            calendarGrid.appendChild(dayElement);
        }
        
        monthCalendar.appendChild(monthHeader);
        monthCalendar.appendChild(calendarGrid);
        calendarContainer.appendChild(monthCalendar);
    }
}
function showDayNotes(year, month, date) {
    const notesForDay = calendarNotes.filter(note => 
        note.year === year && 
        note.month === month && 
        note.date === date
    );
    
    if (notesForDay.length === 0) {
        alert(`No notes for ${monthNames[month]} ${date}, ${year}`);
        return;
    }
    
    noteModalContent.innerHTML = `
        <h3>${monthNames[month]} ${date}, ${year}</h3>
        ${notesForDay.map(note => `
            <div class="note-item">
                <p>${note.note}</p>
                <div class="admin-controls">
                    <button class="edit" onclick="editNote(${note.id})">Edit</button>
                    <button class="delete" onclick="deleteNote(${note.id})">Delete</button>
                </div>
            </div>
        `).join('')}
    `;
    
    noteModal.style.display = 'block';
}
function showAddNoteForm() {
    if (!checkAdminPermission()) return;
    
    noteFormTitle.textContent = 'Add New Note';
    noteForm.reset();
    document.getElementById('noteId').value = '';
    const selectedYear = yearSelect.value;
    if (selectedYear) {
        document.getElementById('noteYear').value = selectedYear;
    }
    
    noteFormModal.style.display = 'block';
}

function editNote(id) {
    if (!checkAdminPermission()) return;
    
    const note = calendarNotes.find(n => n.id === id);
    if (!note) return;
    
    noteFormTitle.textContent = 'Edit Note';
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteYear').value = note.year;
    document.getElementById('noteMonth').value = note.month;
    document.getElementById('noteDate').value = note.date;
    document.getElementById('noteText').value = note.note;
    
    noteFormModal.style.display = 'block';
    noteModal.style.display = 'none';
}
function deleteNote(id) {
    if (!checkAdminPermission()) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        calendarNotes = calendarNotes.filter(note => note.id !== id);
        localStorage.setItem('academicCalendar', JSON.stringify(calendarNotes));
        displayCalendar();
        noteModal.style.display = 'none';
    }
}
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!checkAdminPermission()) return;
    
    const id = document.getElementById('noteId').value;
    const year = document.getElementById('noteYear').value;
    const month = parseInt(document.getElementById('noteMonth').value);
    const date = parseInt(document.getElementById('noteDate').value);
    const noteText = document.getElementById('noteText').value;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (date < 1 || date > daysInMonth) {
        alert(`Invalid date for ${monthNames[month]}. Please enter a date between 1 and ${daysInMonth}.`);
        return;
    }
    
    if (id) {
  
        const noteIndex = calendarNotes.findIndex(n => n.id === parseInt(id));
        if (noteIndex !== -1) {
            calendarNotes[noteIndex] = {
                ...calendarNotes[noteIndex],
                year,
                month,
                date,
                note: noteText
            };
        }
    } else {
    
        const newNote = {
            id: calendarNotes.length > 0 ? Math.max(...calendarNotes.map(n => n.id)) + 1 : 1,
            year,
            month,
            date,
            note: noteText
        };
        calendarNotes.push(newNote);
    }
    
    localStorage.setItem('academicCalendar', JSON.stringify(calendarNotes));
    displayCalendar();
    noteFormModal.style.display = 'none';
});
yearSelect.addEventListener('change', displayCalendar);

document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === noteModal) {
let calendarNotes = JSON.parse(localStorage.getItem('academicCalendar')) || [
    {
        id: 1,
        year: "2025",
        month: 0, 
        date: 1,
        note: "New Year's Day - University Closed"
    },
    {
        id: 2,
        year: "2025",
        month: 2, 
        date: 15,
        note: "Tech Symposium - Computer Science Department"
    },
    {
        id: 3,
        year: "2025",
        month: 2,
        date: 20,
        note: "Math Olympiad - Mathematics Department"
    },
    {
        id: 4,
        year: "2025",
        month: 3, 
        note: "Chemistry Expo - Chemistry Department"
    }
];
const yearSelect = document.getElementById('yearSelect');
const calendarContainer = document.getElementById('calendarContainer');
const noteModal = document.getElementById('noteModal');
const noteModalContent = document.getElementById('noteModalContent');
const noteFormModal = document.getElementById('noteFormModal');
const noteForm = document.getElementById('noteForm');
const noteFormTitle = document.getElementById('noteFormTitle');
const adminCalendarControls = document.getElementById('adminCalendarControls');
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function displayCalendar() {
    const selectedYear = yearSelect.value;
    
    if (!selectedYear) {
        calendarContainer.innerHTML = '<p>Please select a year to view the calendar.</p>';
        return;
    }
    
    calendarContainer.innerHTML = '';
    const monthsGrid = document.createElement('div');
    monthsGrid.className = 'calendar-months-grid';
    for (let month = 0; month < 12; month++) {
        const monthCalendar = document.createElement('div');
        monthCalendar.className = 'month-calendar';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = `${monthNames[month]} ${selectedYear}`;
        
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        const firstDay = new Date(selectedYear, month, 1).getDay();
        const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
    
            const notesForDay = calendarNotes.filter(note => 
                note.year === selectedYear && 
                note.month === month && 
                note.date === day
            );
            
            if (notesForDay.length > 0) {
                dayElement.classList.add('has-note');
            }
            
            let noteText = '';
            if (notesForDay.length > 0) {
                noteText = notesForDay[0].note;
                
                if (noteText.length > 25) {
                    noteText = noteText.substring(0, 22) + '...';
                }
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                ${notesForDay.length > 0 ? 
                    `<div class="note-preview" title="${notesForDay[0].note}">${noteText}</div>` : 
                    '<div class="note-preview" style="visibility: hidden;">.</div>'
                }
            `;
            
            dayElement.onclick = () => showDayNotes(selectedYear, month, day);
            
            calendarGrid.appendChild(dayElement);
        }
        
        monthCalendar.appendChild(monthHeader);
        monthCalendar.appendChild(calendarGrid);
        monthsGrid.appendChild(monthCalendar);
    }
    
    calendarContainer.appendChild(monthsGrid);
}
function showAddNoteForm() {
    if (!checkAdminPermission()) return;
    
    noteFormTitle.textContent = 'Add New Note';
    noteForm.reset();
    document.getElementById('noteId').value = '';
    const selectedYear = yearSelect.value;
    if (selectedYear) {
        document.getElementById('noteYear').value = selectedYear;
    }
    
    noteFormModal.style.display = 'block';
}
function editNote(id) {
    if (!checkAdminPermission()) return;
    
    const note = calendarNotes.find(n => n.id === id);
    if (!note) return;
    
    noteFormTitle.textContent = 'Edit Note';
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteYear').value = note.year;
    document.getElementById('noteMonth').value = note.month;
    document.getElementById('noteDate').value = note.date;
    document.getElementById('noteText').value = note.note;
    
    noteFormModal.style.display = 'block';
    noteModal.style.display = 'none';
}

function deleteNote(id) {
    if (!checkAdminPermission()) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        calendarNotes = calendarNotes.filter(note => note.id !== id);
        localStorage.setItem('academicCalendar', JSON.stringify(calendarNotes));
        displayCalendar();
        noteModal.style.display = 'none';
    }
}
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!checkAdminPermission()) return;
    
    const id = document.getElementById('noteId').value;
    const year = document.getElementById('noteYear').value;
    const month = parseInt(document.getElementById('noteMonth').value);
    const date = parseInt(document.getElementById('noteDate').value);
    const noteText = document.getElementById('noteText').value;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (date < 1 || date > daysInMonth) {
        alert(`Invalid date for ${monthNames[month]}. Please enter a date between 1 and ${daysInMonth}.`);
        return;
    }
    
    if (id) {
        const noteIndex = calendarNotes.findIndex(n => n.id === parseInt(id));
        if (noteIndex !== -1) {
            calendarNotes[noteIndex] = {
                ...calendarNotes[noteIndex],
                year,
                month,
                date,
                note: noteText
            };
        }
    } else {
        const newNote = {
            id: calendarNotes.length > 0 ? Math.max(...calendarNotes.map(n => n.id)) + 1 : 1,
            year,
            month,
            date,
            note: noteText
        };
        calendarNotes.push(newNote);
    }
    
    localStorage.setItem('academicCalendar', JSON.stringify(calendarNotes));
    displayCalendar();
    noteFormModal.style.display = 'none';
});

yearSelect.addEventListener('change', displayCalendar);

document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === noteModal) {
        noteModal.style.display = 'none';
    }
    if (event.target === noteFormModal) {
        noteFormModal.style.display = 'none';
    }
});
displayCalendar();
        noteModal.style.display = 'none';
    }
    if (event.target === noteFormModal) {
        noteFormModal.style.display = 'none';
    }
});

displayCalendar();