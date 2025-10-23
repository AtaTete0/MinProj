from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = 'venue_booking.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    if row is None:
        return None
    return dict(zip(row.keys(), row))

def init_db():
    if not os.path.exists(DATABASE):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS venue_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT NOT NULL,
            eventName TEXT NOT NULL,
            date TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.commit()
        conn.close()

init_db()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/academic-calendar')
def academic_calendar():
    return render_template('academic-calendar.html')

@app.route('/class-routine')
def class_routine():
    return render_template('class-routine.html')

@app.route('/department-events')
def department_events():
    return render_template('department-events.html')

@app.route('/venue-booking')
def venue_booking():
    return render_template('venue-booking.html')

@app.route('/admin')
def admin_panel():
    return render_template('admin-panel.html')

# API Routes for Venue Bookings
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = get_db_connection()
    bookings = conn.execute('SELECT * FROM venue_bookings ORDER BY date').fetchall()
    conn.close()
    return jsonify([dict(b) for b in bookings])

@app.route('/api/bookings', methods=['POST'])
def add_booking():
    data = request.json
    conn = get_db_connection()
    conn.execute('INSERT INTO venue_bookings (department, eventName, date, startTime, endTime, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                 (data['department'], data['eventName'], data['date'], data['startTime'], data['endTime'], data['location'], data['status']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/bookings/<int:id>', methods=['DELETE'])
def delete_booking(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM venue_bookings WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE venue_bookings SET department = ?, eventName = ?, date = ?, startTime = ?, endTime = ?, location = ?, status = ? WHERE id = ?',
                 (data['department'], data['eventName'], data['date'], data['startTime'], data['endTime'], data['location'], data['status'], id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=2323)