import requests
import json

# Update these URLs to match your Django server address
BASE_URL = "http://127.0.0.1:8000/api/auth"  # Adjust if your server runs on different port

def test_register():
    """Test user registration"""
    print("Testing Registration...")
    
    register_data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password1": "testpassword123",
        "password2": "testpassword123"
    }
    
    response = requests.post(f"{BASE_URL}/register/", json=register_data)
    print(f"Register Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("Registration successful!")
        print(f"Response: {response.json()}")
        return response.json()
    else:
        print(f"Registration failed: {response.text}")
        return None

def test_login():
    """Test user login"""
    print("\nTesting Login...")
    
    login_data = {
        "email": "testuser@example.com",  # Use email as login field
        "password": "testpassword123"
    }
    
    response = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Login Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Login successful!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data.get('access')  # dj-rest-auth returns token key
    else:
        print(f"Login failed: {response.text}")
        return None

def test_user_details(auth_token):
    """Test getting user details"""
    print("\nTesting User Details...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',  # JWT uses Bearer format
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f"{BASE_URL}/user/", headers=headers)
    print(f"User Details Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("User details retrieved successfully!")
        print(f"Response: {response.json()}")
        return response.json()
    else:
        print(f"Failed to get user details: {response.text}")
        return None

def test_logout(auth_token):
    """Test user logout"""
    print("\nTesting Logout...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',  # JWT uses Bearer format
        'Content-Type': 'application/json'
    }
    
    response = requests.post(f"{BASE_URL}/logout/", headers=headers)
    print(f"Logout Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Logout successful!")
        print(f"Response: {response.json()}")
    else:
        print(f"Logout failed: {response.text}")

def main():
    """Run all tests"""
    print("Starting API Tests...\n")
    
    # Test registration
    register_result = test_register()
    if True:
        # Test login
        auth_token = test_login()
        
        if auth_token:
            # Test user details
            test_user_details(auth_token)
            
            # Test logout
            test_logout(auth_token)
    else:
        print("Skipping subsequent tests due to registration failure.")

if __name__ == "__main__":
    main()