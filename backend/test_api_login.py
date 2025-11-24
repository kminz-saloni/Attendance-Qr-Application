import requests
import json

def test_login():
    url = 'http://localhost:8000/api/login/'
    data = {
        'username': 'test_faculty',
        'password': 'testpass123'
    }
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Login API successful")
        else:
            print("Login API failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_login()
