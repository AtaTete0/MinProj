
let isAdmin = localStorage.getItem('isAdmin') === 'true';


function updateAdminUI() {
    if (isAdmin) {
        document.body.classList.add('admin-logged-in');
    
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.textContent = 'Admin Logout';
            adminLoginBtn.onclick = logoutAdmin;
        }
        const adminSections = document.querySelectorAll('#adminEventControls, #adminCalendarControls, #adminRoutineControls');
        adminSections.forEach(section => {
            if (section) section.style.display = 'block';
        });
    } else {
        document.body.classList.remove('admin-logged-in');
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.textContent = 'Admin Login';
            adminLoginBtn.onclick = showAdminLogin;
        }
        const adminSections = document.querySelectorAll('#adminEventControls, #adminCalendarControls, #adminRoutineControls');
        adminSections.forEach(section => {
            if (section) section.style.display = 'none';
        });
    }
}
function showAdminLogin() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.style.display = 'block';
    }
}
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        
        if (password === 'sjucms2025') {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            updateAdminUI();
            const adminModal = document.getElementById('adminModal');
            if (adminModal) {
                adminModal.style.display = 'none';
            }
            alert('Admin login successful! You now have editing privileges.');
        } else {
            alert('Incorrect password! Please try again.');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
}


function logoutAdmin() {
    if (confirm('Are you sure you want to logout from admin panel?')) {
        isAdmin = false;
        localStorage.setItem('isAdmin', 'false');
        updateAdminUI();
        alert('Admin logged out successfully!');
    }
}


function navigateTo(page) {
    window.location.href = page;
}
function goBack() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
       
        return;
    } else {
        navigateTo('/');
    }
}
function setupModalClose() {
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
}
function checkAdminPermission() {
    if (!isAdmin) {
        alert('Only administrators can perform this action. Please login as admin first.');
        return false;
    }
    return true;
}

let currentRating = 0;

function showFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal) {
        feedbackModal.style.display = 'block';
        resetFeedbackForm();
    }
}
function closeFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal) {
        feedbackModal.style.display = 'none';
    }
}

function setRating(rating) {
    currentRating = rating;
    document.getElementById('feedbackRating').value = rating;
    
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function resetFeedbackForm() {
    document.getElementById('feedbackForm').reset();
    currentRating = 0;
    document.getElementById('feedbackRating').value = 0;
    
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active');
    });
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const feedbackType = document.querySelector('input[name="feedbackType"]:checked').value;
        const rating = document.getElementById('feedbackRating').value;
        const message = document.getElementById('feedbackMessage').value.trim();
        const email = document.getElementById('feedbackEmail').value.trim();
        
        if (!message) {
            alert('Please provide your feedback message.');
            return;
        }
        
        if (rating === '0') {
            alert('Please rate your experience by clicking on the stars.');
            return;
        }
        const feedback = {
            type: feedbackType,
            rating: parseInt(rating),
            message: message,
            email: email || 'Not provided',
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };
    
        let feedbacks = JSON.parse(localStorage.getItem('userFeedbacks')) || [];
        feedbacks.push(feedback);
        localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks));
    
        showFeedbackSuccess();
    });
}

function showFeedbackSuccess() {
    const feedbackContainer = document.querySelector('.feedback-form-container');
    feedbackContainer.innerHTML = `
        <div class="feedback-success">
            <div class="success-icon">✅</div>
            <h3>Thank You for Your Feedback!</h3>
            <p>Your feedback has been received and will help us improve the system. We appreciate you taking the time to share your thoughts with us.</p>
            <button class="submit-btn" onclick="closeFeedbackModal()" style="margin-top: 1rem;">Close</button>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', function() {
    updateAdminUI();
    setupModalClose();
    
    const adminModal = document.getElementById('adminModal');
    const feedbackModal = document.getElementById('feedbackModal');
    window.addEventListener('click', (event) => {
        if (adminModal && event.target === adminModal) {
            adminModal.style.display = 'none';
        }
        if (feedbackModal && event.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
});

function navigateTo(route) {
    window.location.href = route;
}

