
let routines = JSON.parse(localStorage.getItem('classRoutines')) || {};
const departmentSelect = document.getElementById('departmentSelect');
const semesterSelect = document.getElementById('semesterSelect');
const routineContainer = document.getElementById('routineContainer');
const adminRoutineControls = document.getElementById('adminRoutineControls');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
    '8:00 - 9:00',
    '9:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 1:00',
    '1:00 - 2:00',
    '2:00 - 3:00',
    '3:00 - 4:00',
    '4:00 - 5:00'
];
let currentEditingCell = null;
function displayRoutine() {
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    
    if (!department || !semester) {
        routineContainer.innerHTML = '<div class="no-routine-message"><p>Please select both department and semester to view the routine.</p></div>';
        return;
    }
    
    const routineKey = `${department}_${semester}`;
    if (!routines[routineKey]) {
        routines[routineKey] = initializeRoutine();
    }
    
    const routine = routines[routineKey];
    
    let tableHTML = `
        <table class="routine-table">
            <thead>
                <tr>
                    <th class="time-slot">Time/Day</th>
    `;
    
    days.forEach(day => {
        tableHTML += `
            <th>
                ${day}
                ${isAdmin ? `<button class="delete-col" onclick="deleteColumn('${day}')">×</button>` : ''}
            </th>
        `;
    });
    
    tableHTML += `</tr></thead><tbody>`;
    timeSlots.forEach((timeSlot, timeIndex) => {
        tableHTML += `
            <tr>
                <td class="time-slot">
                    ${timeSlot}
                    ${isAdmin ? `<button class="delete-row" onclick="deleteRow(${timeIndex})">×</button>` : ''}
                </td>
        `;
        
        days.forEach(day => {
            const classInfo = routine[day] && routine[day][timeIndex] ? routine[day][timeIndex] : '';
            const cellClass = isAdmin ? 'editable' : '';
            
            tableHTML += `
                <td class="${cellClass}" 
                    onclick="${isAdmin ? `startEditing('${day}', ${timeIndex})` : ''}"
                    data-day="${day}"
                    data-time="${timeIndex}">
            `;
            
            if (classInfo && (classInfo.subject || classInfo.room || classInfo.teacher)) {
                tableHTML += `
                    <div class="class-info">
                        ${classInfo.subject ? `<div class="subject">${classInfo.subject}</div>` : ''}
                        ${classInfo.room ? `<div class="room">${classInfo.room}</div>` : ''}
                        ${classInfo.teacher ? `<div class="teacher">${classInfo.teacher}</div>` : ''}
                    </div>
                `;
            } else if (classInfo && typeof classInfo === 'string') {
                tableHTML += `
                    <div class="class-info">
                        <div class="subject">${classInfo}</div>
                    </div>
                `;
            } else {
                if (isAdmin) {
                    tableHTML += `<div class="empty-cell">Click to add class</div>`;
                }
            }
            
            tableHTML += `</td>`;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `</tbody></table>`;
    
    routineContainer.innerHTML = tableHTML;
    localStorage.setItem('classRoutines', JSON.stringify(routines));
}

function initializeRoutine() {
    const routine = {};
    days.forEach(day => {
        routine[day] = Array(timeSlots.length).fill('');
    });
    return routine;
}
function startEditing(day, timeIndex) {
    if (!checkAdminPermission()) return;
    if (currentEditingCell) {
        saveCell(currentEditingCell.day, currentEditingCell.timeIndex);
    }
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    const routineKey = `${department}_${semester}`;
    
    const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeIndex}"]`);
    const currentValue = routines[routineKey][day][timeIndex];

    let subject = '', room = '', teacher = '';
    if (currentValue) {
        if (typeof currentValue === 'object') {
            subject = currentValue.subject || '';
            room = currentValue.room || '';
            teacher = currentValue.teacher || '';
        } else {
            subject = currentValue;
        }
    }
    
    cell.innerHTML = `
        <input type="text" value="${subject}" placeholder="Subject" class="subject-input" id="subject-${day}-${timeIndex}">
        <input type="text" value="${room}" placeholder="Room" class="room-input" id="room-${day}-${timeIndex}">
        <textarea placeholder="Teacher" class="teacher-input" id="teacher-${day}-${timeIndex}">${teacher}</textarea>
        <div class="edit-controls">
            <button class="save-btn" onclick="saveCell('${day}', ${timeIndex})">Save</button>
            <button class="cancel-btn" onclick="cancelEditing('${day}', ${timeIndex})">Cancel</button>
        </div>
    `;
    
    cell.classList.add('editing');
    currentEditingCell = { day, timeIndex, cell };
    const subjectInput = document.getElementById(`subject-${day}-${timeIndex}`);
    if (subjectInput) {
        subjectInput.focus();
        subjectInput.select();
    }
    const inputs = cell.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveCell(day, timeIndex);
            }
        });
    });
}
function saveCell(day, timeIndex) {
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    const routineKey = `${department}_${semester}`;
    
    const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeIndex}"]`);
    const subjectInput = document.getElementById(`subject-${day}-${timeIndex}`);
    const roomInput = document.getElementById(`room-${day}-${timeIndex}`);
    const teacherInput = document.getElementById(`teacher-${day}-${timeIndex}`);
    
    if (!subjectInput || !roomInput || !teacherInput) return;
    
    const subject = subjectInput.value.trim();
    const room = roomInput.value.trim();
    const teacher = teacherInput.value.trim();
    
    if (subject) {
        routines[routineKey][day][timeIndex] = {
            subject,
            room,
            teacher
        };
    } else {
        routines[routineKey][day][timeIndex] = '';
    }
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    currentEditingCell = null;
    displayRoutine();
}

function cancelEditing(day, timeIndex) {
    
    currentEditingCell = null;
    displayRoutine();
}
function addRow() {
    if (!checkAdminPermission()) return;
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    
    if (!department || !semester) {
        alert('Please select both department and semester first.');
        return;
    }
    
    const routineKey = `${department}_${semester}`;
    const newTimeSlot = `New Time Slot`;
    
    timeSlots.push(newTimeSlot);
    
    days.forEach(day => {
        routines[routineKey][day].push('');
    });
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    displayRoutine();
}
function addColumn() {
    if (!checkAdminPermission()) return;
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    
    if (!department || !semester) {
        alert('Please select both department and semester first.');
        return;
    }
    
    const newDay = prompt('Enter the name for the new day:');
    if (!newDay) return;
    
    const routineKey = `${department}_${semester}`;
    
    routines[routineKey][newDay] = Array(timeSlots.length).fill('');
    days.push(newDay);
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    displayRoutine();
}
function deleteRow(timeIndex) {
    if (!checkAdminPermission()) return;
    
    if (!confirm('Are you sure you want to delete this time slot?')) return;
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    const routineKey = `${department}_${semester}`;
    
    timeSlots.splice(timeIndex, 1);
    
    days.forEach(day => {
        routines[routineKey][day].splice(timeIndex, 1);
    });
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    displayRoutine();
}
function deleteColumn(day) {
    if (!checkAdminPermission()) return;
    
    if (!confirm('Are you sure you want to delete this day?')) return;
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    const routineKey = `${department}_${semester}`;
    
    const dayIndex = days.indexOf(day);
    if (dayIndex !== -1) {
        days.splice(dayIndex, 1);
        delete routines[routineKey][day];
    }
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    displayRoutine();
}
function resetRoutine() {
    if (!checkAdminPermission()) return;
    
    if (!confirm('Are you sure you want to reset the routine? This will clear all data.')) return;
    
    const department = departmentSelect.value;
    const semester = semesterSelect.value;
    
    if (!department || !semester) {
        alert('Please select both department and semester first.');
        return;
    }
    
    const routineKey = `${department}_${semester}`;
    routines[routineKey] = initializeRoutine();
    
    localStorage.setItem('classRoutines', JSON.stringify(routines));
    displayRoutine();
}
document.addEventListener('click', (e) => {
    if (currentEditingCell && !e.target.closest('.editing')) {
        saveCell(currentEditingCell.day, currentEditingCell.timeIndex);
    }
});
departmentSelect.addEventListener('change', displayRoutine);
semesterSelect.addEventListener('change', displayRoutine);
displayRoutine();