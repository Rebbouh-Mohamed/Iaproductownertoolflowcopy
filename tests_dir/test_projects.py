import requests
import json

# Update these URLs to match your Django server address
BASE_URL = "http://127.0.0.1:8000/api/auth"  # Authentication endpoints
PROJECTS_URL = "http://127.0.0.1:8000/api/projects"  # Project endpoints

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
        return response_data.get('access')  # JWT returns 'access' token
    else:
        print(f"Login failed: {response.text}")
        return None

def test_list_project_types(auth_token):
    """Test listing project types"""
    print("\nTesting List Project Types...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.get(f"{PROJECTS_URL}/types/", headers=headers)
    print(f"List Project Types Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Project types retrieved successfully!")
        response_data = response.json()
        print(f"Number of project types: {len(response_data)}")
        if response_data:
            print(f"First project type: {response_data[0]}")
        return response_data
    else:
        print(f"Failed to get project types: {response.text}")
        return None

def test_create_project_type(auth_token):
    """Test creating a project type"""
    print("\nTesting Create Project Type...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    project_type_data = {
        "name": "test_type"
    }
    
    response = requests.post(f"{PROJECTS_URL}/types/", json=project_type_data, headers=headers)
    print(f"Create Project Type Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("Project type created successfully!")
        response_data = response.json()
        print(f"Created project type: {response_data}")
        return response_data.get('id')
    else:
        print(f"Project type creation failed: {response.text}")
        return None

def test_list_projects(auth_token):
    """Test listing projects"""
    print("\nTesting List Projects...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.get(f"{PROJECTS_URL}/", headers=headers)
    print(f"List Projects Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Projects retrieved successfully!")
        response_data = response.json()
        print(f"Number of projects: {len(response_data)}")
        if response_data:
            print(f"First project: {response_data[0]}")
        return response_data
    else:
        print(f"Failed to get projects: {response.text}")
        return None

def test_create_project(auth_token, project_type_id):
    """Test creating a project"""
    print("\nTesting Project Creation...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    project_data = {
        "name": "Test Project",
        "description": "This is a test project for testing purposes",
        "project_type_id": project_type_id,
        "status": "en_cours",
        "start_date": "2025-01-15",
        "end_date": "2025-12-31"
    }
    
    response = requests.post(f"{PROJECTS_URL}/", json=project_data, headers=headers)
    print(f"Create Project Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("Project created successfully!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data.get('id')
    else:
        print(f"Project creation failed: {response.text}")
        return None

def test_get_single_project(auth_token, project_id):
    """Test getting a single project"""
    print(f"\nTesting Get Single Project (ID: {project_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.get(f"{PROJECTS_URL}/{project_id}/", headers=headers)
    print(f"Get Single Project Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Single project retrieved successfully!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data
    else:
        print(f"Failed to get single project: {response.text}")
        return None

def test_update_project(auth_token, project_id):
    """Test updating a project"""
    print(f"\nTesting Update Project (ID: {project_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    update_data = {
        "name": "Updated Test Project",
        "description": "This project has been updated",
        "project_type_id": 1,
        "status": "termine",
        "start_date": "2025-01-20",
        "end_date": "2025-11-30"
    }
    
    response = requests.put(f"{PROJECTS_URL}/{project_id}/", json=update_data, headers=headers)
    print(f"Update Project Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Project updated successfully!")
        response_data = response.json()
        print(f"Response: {response_data}")
        return response_data
    else:
        print(f"Project update failed: {response.text}")
        return None

def test_filter_projects(auth_token):
    """Test filtering projects"""
    print("\nTesting Project Filtering...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    # Filter by status
    response = requests.get(f"{PROJECTS_URL}/?status=termine", headers=headers)
    print(f"Filter by status 'termine' - Status Code: {response.status_code}")
    
    if response.status_code == 200:
        response_data = response.json()
        print(f"Filtered projects count: {len(response_data)}")
    
    # Filter by project type
    response = requests.get(f"{PROJECTS_URL}/?project_type_id=1", headers=headers)
    print(f"Filter by project_type_id '1' - Status Code: {response.status_code}")
    
    if response.status_code == 200:
        response_data = response.json()
        print(f"Filtered projects count: {len(response_data)}")

def test_search_projects(auth_token):
    """Test searching projects"""
    print("\nTesting Project Search...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    # Search by name
    response = requests.get(f"{PROJECTS_URL}/?search=Test", headers=headers)
    print(f"Search for 'Test' - Status Code: {response.status_code}")
    
    if response.status_code == 200:
        response_data = response.json()
        print(f"Search results count: {len(response_data)}")

def test_delete_project(auth_token, project_id):
    """Test deleting a project"""
    print(f"\nTesting Delete Project (ID: {project_id})...")
    
    headers = {
        'Authorization': f'Bearer {auth_token}'
    }
    
    response = requests.delete(f"{PROJECTS_URL}/{project_id}/", headers=headers)
    print(f"Delete Project Status Code: {response.status_code}")
    
    if response.status_code == 204:
        print("Project deleted successfully!")
        return True
    else:
        print(f"Project deletion failed: {response.text}")
        return False

def test_unauthorized_access():
    """Test unauthorized access to project endpoints"""
    print("\nTesting Unauthorized Access...")
    
    # Try to access without token
    response = requests.get(f"{PROJECTS_URL}/")
    print(f"Unauthorized access - Status Code: {response.status_code}")
    
    if response.status_code == 401:
        print("Unauthorized access properly blocked!")
    else:
        print(f"Unexpected response: {response.text}")

def main():
    """Run all tests"""
    print("Starting Project App Tests...\n")
    
    # Test login to get token
    auth_token = test_login()
    
    if not auth_token:
        print("Cannot proceed with tests - login failed.")
        return
    
    # Test unauthorized access first
    test_unauthorized_access()
    
    # Test project types
    project_types = test_list_project_types(auth_token)
    project_type_id = test_create_project_type(auth_token)
    
    # Test creating a project
    project_id = test_create_project(auth_token, project_type_id)
    
    if project_id:
        # Test getting all projects
        test_list_projects(auth_token)
        
        # Test getting single project
        test_get_single_project(auth_token, project_id)
        
        # Test updating project
        test_update_project(auth_token, project_id)
        
        # Test filtering projects
        test_filter_projects(auth_token)
        
        # Test searching projects
        test_search_projects(auth_token)
        
        # Test deleting the project
        test_delete_project(auth_token, project_id)
    
    print("\nAll project tests completed!")

if __name__ == "__main__":
    main()