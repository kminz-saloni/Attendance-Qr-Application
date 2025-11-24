"""
End-to-End Test Runner for QR Attendance Workflow
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

# Credentials (must match setup_test_data.py)
FACULTY_CREDS = {"username": "test_faculty", "password": "testpass123"}
STUDENT_CREDS = {"username": "test_student", "password": "testpass123"}

def print_step(msg):
    print(f"\n[STEP] {msg}")

def print_ok(msg):
    print(f"  [OK] {msg}")

def print_fail(msg):
    print(f"  [FAIL] {msg}")

def login(creds, role_name):
    print_step(f"Logging in as {role_name}")
    try:
        response = requests.post(f"{BASE_URL}/login/", json=creds)
        if response.status_code == 200:
            token = response.json().get('access')
            print_ok(f"Logged in as {creds['username']}")
            return token
        else:
            print_fail(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print_fail(f"Error: {e}")
        return None

def get_active_session(faculty_token):
    print_step("Getting active session for faculty")
    headers = {"Authorization": f"Bearer {faculty_token}"}
    try:
        response = requests.get(f"{BASE_URL}/sessions/", headers=headers)
        if response.status_code == 200:
            sessions = response.json()
            if sessions:
                # Find the one we created (should be active)
                for s in sessions:
                    if s.get('active'):
                        print_ok(f"Found active session ID: {s['id']}")
                        return s['id']
                print_fail("No active session found")
                return None
            else:
                print_fail("No sessions found")
                return None
        else:
            print_fail(f"Failed to get sessions: {response.text}")
            return None
    except Exception as e:
        print_fail(f"Error: {e}")
        return None

def generate_qr(faculty_token, session_id):
    print_step(f"Generating QR for session {session_id}")
    headers = {"Authorization": f"Bearer {faculty_token}"}
    try:
        response = requests.post(f"{BASE_URL}/generate-qr/", 
                                json={"session_id": session_id}, 
                                headers=headers)
        if response.status_code == 200:
            qr_code = response.json().get('qr_code')
            print_ok(f"QR Generated: {qr_code}")
            return qr_code
        else:
            print_fail(f"Failed to generate QR: {response.text}")
            return None
    except Exception as e:
        print_fail(f"Error: {e}")
        return None

def mark_attendance(student_token, session_id, qr_code):
    print_step("Marking attendance as student")
    headers = {"Authorization": f"Bearer {student_token}"}
    try:
        response = requests.post(f"{BASE_URL}/mark-attendance/", 
                                json={
                                    "session_id": session_id,
                                    "qr_code": qr_code
                                }, 
                                headers=headers)
        if response.status_code == 201:
            print_ok("Attendance marked successfully")
            return True
        elif response.status_code == 400 and "already marked" in response.text:
            print_ok("Attendance was already marked (idempotent)")
            return True
        else:
            print_fail(f"Failed to mark attendance: {response.text}")
            return False
    except Exception as e:
        print_fail(f"Error: {e}")
        return False

def verify_attendance(student_token):
    print_step("Verifying attendance record")
    headers = {"Authorization": f"Bearer {student_token}"}
    try:
        response = requests.get(f"{BASE_URL}/attendance/my-attendance/", headers=headers)
        if response.status_code == 200:
            records = response.json()
            if records:
                print_ok(f"Found {len(records)} attendance records")
                return True
            else:
                print_fail("No attendance records found")
                return False
        else:
            print_fail(f"Failed to fetch attendance: {response.text}")
            return False
    except Exception as e:
        print_fail(f"Error: {e}")
        return False

def main():
    print("=== STARTING END-TO-END TEST ===")
    
    # 1. Login Faculty
    faculty_token = login(FACULTY_CREDS, "Faculty")
    if not faculty_token: return

    # 2. Get Session
    session_id = get_active_session(faculty_token)
    if not session_id: return

    # 3. Generate QR
    qr_code = generate_qr(faculty_token, session_id)
    if not qr_code: return

    # 4. Login Student
    student_token = login(STUDENT_CREDS, "Student")
    if not student_token: return

    # 5. Mark Attendance
    if mark_attendance(student_token, session_id, qr_code):
        # 6. Verify
        verify_attendance(student_token)
    
    print("\n=== TEST COMPLETE ===")

if __name__ == "__main__":
    main()
